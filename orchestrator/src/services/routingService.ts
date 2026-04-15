import axios from "axios";
import * as polyline from "@mapbox/polyline";
import { PrismaClient } from "@prisma/client";
import { fetchSheltersNearPath } from "./osmService";
import { API_PATHS, SHELTER_SELECT_FIELDS } from "../config/constants";
import { RedisCache } from "../infrastructure/cache/RedisCache";
import { IRoutingResponse, RouteShelter } from "../types/types";
import { IAuthenticator } from "../infrastructure/auth/IAuthenticator";
import { OSMRoute } from "../types/osmType";
import { IKafkaProducer } from "../infrastructure/messaging/types";
import { IRealtimeService } from "../infrastructure/realtime/types";
const { v4: uuidv4 } = require("uuid");

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

  /**
   * Helper to fetch live OSM data only if explicitly requested.
   * Isolating this logic keeps the main flow clean.
   * If Overpass is down, it will fail gracefully and we will only use the safeway DB.
   */
  private async getExternalOsmShelters(
    routePoints: [number, number][],
    enabled: boolean,
  ): Promise<RouteShelter[]> {
    if (!enabled) return [];

    try {
      console.log("📡 Fetching live shelters from OSM Overpass...");
      return await fetchSheltersNearPath(routePoints);
    } catch (error) {
      console.warn("⚠️ OSM Fetch failed, proceeding with local database only.");
      return [];
    }
  }

  async getSafeRoutes(start: string, end: string, useLiveOsm: boolean = false) {
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

    // B. Calculate bounds for Prisma query
    const allLats = allRoutePoints.flat().map((p: any) => p[0]);
    const allLngs = allRoutePoints.flat().map((p: any) => p[1]);
    const padding = 0.01;

    // C. Fetch shelters (using the wider bounds)
    const [osmShelters, dbShelters] = await Promise.all([
      this.getExternalOsmShelters(allRoutePoints[0], useLiveOsm),
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
        select: SHELTER_SELECT_FIELDS,
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
    const requestId = uuidv4();

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
  }
}
