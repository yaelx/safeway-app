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
    // routeUrl = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=polyline`;
    const routeUrl = `${API_PATHS.OSRM_ROUTE}${start};${end}?overview=full&geometries=polyline`;
    console.log("Calling OSRM with points:", routeUrl);
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

    // E. Ensure OSM shelters also have x/y before merging
    const osmFormatted = osmShelters.map((s: any) => ({
      ...s,
      x: s.lng || s.x,
      y: s.lat || s.y,
    }));

    // D. Merge and Format
    const allShelters = [
      ...osmFormatted,
      ...dbShelters.map((s) => ({
        id: s.id, // Preserve ID
        x: s.lng, // Python expects 'x' for lng
        y: s.lat, // Python expects 'y' for lat
        name: s.name,
        address: s.address,
        isOfficial: true,
      })),
    ];

    console.log("Calling OSRM with points: start:", start, "end:", end);

    // E. Use the new Client for the Python Solver call
    const safetyData = await logicServerClient.evaluateRoute(
      points,
      allShelters,
    );

    // F. Keep your specific math for unique safe shelters
    const safeSheltersCount = new Set(
      safetyData.safetyReport
        .filter((p: any) => p.s === true)
        .map((p: any) => p.name),
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
