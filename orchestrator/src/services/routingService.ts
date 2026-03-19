import axios from "axios";
import * as polyline from "@mapbox/polyline";
import { PrismaClient } from "@prisma/client";
import { fetchSheltersNearPath } from "./osmService";
import { API_PATHS } from "../config/constants";
import { logicServerClient } from "./logicServerClient";

export class RoutingService {
  constructor(private prisma: PrismaClient) {}

  async getSafeRoute(start: string, end: string) {
    // A. Fetch Route from OSRM
    const routeUrl = `${API_PATHS.OSRM_ROUTE}${start};${end}?overview=full&geometries=polyline`;
    const routeRes = await axios.get(routeUrl);
    const routeData = routeRes.data;

    if (!routeData.routes?.length) throw new Error("No route found");
    const points = polyline.decode(routeData.routes[0].geometry) as [
      number,
      number,
    ][];

    // B. Calculate bounds for database query
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    const padding = 0.01;

    // C. Fetch shelters (Prisma + OSM)
    const [osmShelters, dbShelters] = await Promise.all([
      fetchSheltersNearPath(points),
      this.prisma.shelter.findMany({
        where: {
          lat: {
            gte: Math.min(...lats) - padding,
            lte: Math.max(...lats) + padding,
          },
          lng: {
            gte: Math.min(...lngs) - padding,
            lte: Math.max(...lngs) + padding,
          },
        },
      }),
    ]);

    // D. Merge and Format
    const allShelters = [
      ...osmShelters,
      ...dbShelters.map((s) => ({
        x: s.lng,
        y: s.lat,
        name: s.name,
        isOfficial: true,
      })),
    ];

    // E. Use the new Client for the Python Solver call
    const safetyData = await logicServerClient.evaluateRoute(
      points,
      allShelters,
    );

    // F. Keep your specific math for unique safe shelters
    const safeSheltersCount = new Set(
      safetyData.safetyReport
        .filter((p: any) => p.s === true)
        .map((p: any) => p.shelterName),
    ).size;

    return {
      summary: {
        distance: routeData.routes[0].distance,
        unit: "km",
        safetyScore: safetyData.safetyScore,
        safeSheltersCount,
      },
      routeGeometry: routeData.routes[0].geometry,
      safetyReport: safetyData.safetyReport,
    };
  }
}
