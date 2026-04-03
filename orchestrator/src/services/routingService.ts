import axios from "axios";
import * as polyline from "@mapbox/polyline";
import { PrismaClient } from "@prisma/client";
import { fetchSheltersNearPath } from "./osmService";
import { API_PATHS } from "../config/constants";
import { logicServerClient } from "./logicServerClient";
import { RedisCache } from "../infrastructure/cache/RedisCache";
import {
  IRoutingResponse,
  RouteShelter,
  RouteData,
  ScoredRoute,
} from "../types/types";
import { IAuthenticator } from "../infrastructure/auth/IAuthenticator";
import { OSMRoute } from "../types/osmType";

export class RoutingService {
  private cache = new RedisCache();

  constructor(
    private prisma: PrismaClient,
    private authenticator: IAuthenticator,
  ) {}

  private parseCoords(coordStr: string): [number, number] {
    const [lng, lat] = coordStr.split(",").map(Number);
    if (isNaN(lng) || isNaN(lat)) {
      throw new Error(`Invalid coordinate format: ${coordStr}`);
    }
    return [lng, lat];
  }

  async getSafeRoutes(start: string, end: string) {
    let routeData: any;
    console.log("\nReceiced new getSafeRoutes request");
    // start is "34.123,32.456"
    const startCoords = this.parseCoords(start);
    const endCoords = this.parseCoords(end);

    // 2. Check Cache using the numeric arrays [lng, lat]
    const cachedData = await this.cache.getRoute(startCoords, endCoords);
    if (cachedData) {
      return cachedData as IRoutingResponse;
    }

    // 3. Cache Miss -> Call OSM
    try {
      const routeUrl = `${API_PATHS.OSRM_ROUTE}${start};${end}?alternatives=true&overview=full&geometries=polyline`;
      const routeRes = await axios.get(routeUrl);
      routeData = routeRes.data;
      console.log("OSRM routes response length:", routeData.routes.length);

      if (!routeData.routes || routeData.routes.length === 0) {
        throw new Error("OSRM returned no routes for this path.");
      }
    } catch (error: any) {
      console.error("OSRM API Error:", error.message);
      throw new Error("Failed to fetch routes from navigation service.");
    }

    // A. Decode ALL candidate routes instead of just index [0]
    const allRoutePoints = routeData.routes.map(
      (r: OSMRoute) => polyline.decode(r.geometry) as [number, number][],
    );

    // B. Calculate bounds covering ALL paths
    const allLats = allRoutePoints.flat().map((p: any) => p[0]);
    const allLngs = allRoutePoints.flat().map((p: any) => p[1]);
    const padding = 0.01;

    // C. Fetch shelters (using the wider bounds)
    const [osmShelters, dbShelters] = await Promise.all([
      fetchSheltersNearPath(allRoutePoints[0]), // You can refine this to use a union of points
      this.prisma.shelter.findMany({
        where: {
          lat: {
            gte: Math.min(...allLats) - padding,
            lte: Math.max(...allLats) + padding,
          },
          lng: {
            gte: Math.min(...allLngs) - padding,
            lte: Math.max(...allLngs) + padding,
          },
        },
      }),
    ]);

    // D. Merge and Format
    const allShelters: RouteShelter[] = [
      ...osmShelters,
      ...dbShelters.map((s) => ({
        id: s.id,
        lng: s.lng,
        lat: s.lat,
        name: s.name,
        address: s.address || "",
        isOfficial: true,
        type: s.type || "Public Shelter",
      })),
    ];

    const authHeader = await this.authenticator.getAccessToken();

    // D. Call the updated Bulk Client
    const scoredRoutes: ScoredRoute[] =
      await logicServerClient.evaluateAlternatives(
        allRoutePoints,
        allShelters,
        authHeader,
      );

    // E. Merge OSRM metadata (distance/duration) with Python safety data
    // Python returns these sorted by safetyScore
    const top3Routes: RouteData[] = scoredRoutes
      .slice(0, 3)
      .map((scored: ScoredRoute) => {
        const originalOSRM: OSMRoute = routeData.routes[scored.index];
        return {
          index: scored.index,
          geometry: originalOSRM.geometry as string, // use original OSM route data since we want string geometry
          safetyScore: scored.safetyScore,
          safetyReport: scored.safetyReport,
          distance: originalOSRM.distance,
          duration: originalOSRM.duration,
        };
      });

    const resp = {
      routes: top3Routes, // Now returning an array of 3 routes
      totalFound: routeData.routes.length,
    } as IRoutingResponse;

    this.cache
      .setRoute(startCoords, endCoords, resp)
      .catch((err) => console.error("Redis Set Error:", err));

    return resp;
  }
}
