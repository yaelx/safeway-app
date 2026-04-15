import axios from "axios";
// const { v4: uuidv4 } = require("uuid");
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
  PythonRouteResponse,
  PythonSolverResponse,
} from "../types/types";
import { IAuthenticator } from "../infrastructure/auth/IAuthenticator";
import { OSMRoute } from "../types/osmType";
import { IKafkaProducer } from "../infrastructure/messaging/types";
import { IRealtimeService } from "../infrastructure/realtime/types";

export class RoutingService {
  private cache = new RedisCache();

  constructor(
    private prisma: PrismaClient,
    private authenticator: IAuthenticator,
    private kafkaService: IKafkaProducer,
    private realtime: IRealtimeService,
  ) {}

  private parseCoords(coordStr: string): [number, number] {
    const [lng, lat] = coordStr.split(",").map(Number);
    if (isNaN(lng) || isNaN(lat)) {
      throw new Error(`Invalid coordinate format: ${coordStr}`);
    }
    return [lng, lat];
  }

  async getSafeRoutes(start: string, end: string) {
    let osrmRoutes: any;
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
      const routeUrl = `${API_PATHS.OSRM_ROUTE}${start};${end}?alternatives=true&overview=full&geometries=polyline&steps=true&annotations=true`;
      const routeRes = await axios.get(routeUrl);
      osrmRoutes = routeRes.data;
      console.log("OSRM routes response length:", osrmRoutes.routes.length);

      if (!osrmRoutes.routes || osrmRoutes.routes.length === 0) {
        throw new Error("OSRM returned no routes for this path.");
      }
    } catch (error: any) {
      console.error("OSRM API Error:", error.message);
      throw new Error("Failed to fetch routes from navigation service.");
    }

    // A. Decode for bounds calculation (needed to find shelters in the area)
    const allRoutePoints = osrmRoutes.routes.map(
      (r: OSMRoute) => polyline.decode(r.geometry) as [number, number][],
    );

    // B. Calculate bounds (Same as before, used for the Prisma query)
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
    const requestId = "test-1234567890"; // uuidv4();

    const kafkaPayload = {
      requestId,
      timestamp: new Date().toISOString(),
      routes: osrmRoutes.routes.map((r: any, index: number) => ({
        index,
        legs: r.legs,
        geometry: r.geometry,
        distance: r.distance,
        duration: r.duration,
      })),
      shelterData: allShelters,
    };

    try {
      // Fire and forget
      await this.kafkaService.sendRouteRequest(kafkaPayload);
      this.realtime.publishStatus(
        requestId,
        "processing",
        "Safety Analysis Started",
      );

      // Return immediate receipt to the Controller
      return {
        status: "processing",
        requestId: requestId,
        message: "Your routes are being analyzed for safety.",
      };
    } catch (error) {
      console.error("Kafka Pipeline Error:", error);
      throw new Error("Safety Engine is temporarily offline.");
    }

    // const payloads = osrmRoutes.routes
    //   .filter((r: OSMRoute) => r.geometry !== null)
    //   .map((r: OSMRoute) => ({
    //     legs: r.legs, // Contains steps, ref, and intersections
    //     shelterData: allShelters,
    //   }));

    // // D. Call the updated Bulk Client
    // const pythonRes: PythonSolverResponse =
    //   await logicServerClient.evaluateAlternatives(payloads, authHeader);
    // const { routes, totalFound } = pythonRes;

    // if (!routes || routes.length === 0) {
    //   throw new Error("Python Logic Server returned no routes.");
    // }

    // // E. Merge OSRM metadata (distance/duration) with Python safety data
    // // Python returns these sorted by safetyScore
    // const sortedRoutes: RouteData[] = routes.map((r: PythonRouteResponse) => {
    //   const originalOSRM: OSMRoute = osrmRoutes.routes[r.index];

    //   return {
    //     id: r.id,
    //     index: r.index,
    //     safetyScore: r.safetyScore,
    //     geometry: originalOSRM.geometry as string,
    //     segments: r.segments,
    //     distance: originalOSRM.distance,
    //     duration: originalOSRM.duration,
    //   };
    // });

    // const resp = {
    //   routes: sortedRoutes, // Now returning an array of 3 routes
    //   totalFound: sortedRoutes.length,
    // } as IRoutingResponse;

    // this.cache
    //   .setRoute(startCoords, endCoords, resp)
    //   .catch((err) => console.error("Redis Set Error:", err));

    // return resp;
  }
}
