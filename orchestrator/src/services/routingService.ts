import axios from "axios";
import * as polyline from "@mapbox/polyline";
import { PrismaClient } from "@prisma/client";
import { fetchSheltersNearPath } from "./osmService";
import { API_PATHS } from "../config/constants";
import { logicServerClient } from "./logicServerClient";
import { ScoredRoute } from "../types/types";
import { IAuthenticator } from "../infrastructure/auth/IAuthenticator";

export type OSMRoute = {
  geometry: string;
  distance: number;
  duration: number;
  weight: number;
  weight_name: string;
  legs: {
    steps: any[];
    weight: number;
    summary: string;
    duration: number;
    distance: number;
  }[];
};

export class RoutingService {
  constructor(
    private prisma: PrismaClient,
    private authenticator: IAuthenticator,
  ) {}

  async getSafeRoutes(start: string, end: string) {
    let routeData: any;
    console.log("\nReceiced new getSafeRoutes request");

    // 1. Robust OSRM Fetching
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
    const top3Routes = scoredRoutes.slice(0, 3).map((scored: ScoredRoute) => {
      const originalOSRM: OSMRoute = routeData.routes[scored.routeIndex];
      return {
        index: scored.routeIndex,
        geometry: originalOSRM.geometry, // use original OSM route data since we want string geometry
        safetyScore: scored.safetyScore,
        safetyReport: scored.safetyReport,
        distance: originalOSRM.distance,
        duration: originalOSRM.duration,
      };
    });

    return {
      routes: top3Routes, // Now returning an array of 3 routes
      totalFound: routeData.routes.length,
    };
  }

  // async getSafeRoute(start: string, end: string) {
  //   // A. Fetch Route from OSRM
  //   // routeUrl = `https://router.project-osrm.org/route/v1/driving/${start};${end}?alternatives=true&overview=full&geometries=polyline`;
  //   const alternatives = 5;
  //   const routeUrl = `${API_PATHS.OSRM_ROUTE}${start};${end}?alternatives=${alternatives}&overview=full&geometries=polyline&annotations=true`;
  //   console.log("Calling OSRM with points:", routeUrl);
  //   const routeRes = await axios.get(routeUrl);
  //   const routeData = routeRes.data;
  //   console.log("OSRM response:", routeData);

  //   if (!routeData.routes?.length) throw new Error("No route found");
  //   const points = polyline.decode(routeData.routes[0].geometry) as [
  //     number,
  //     number,
  //   ][];

  //   // B. Calculate bounds for database query
  //   const lats = points.map((p) => p[0]);
  //   const lngs = points.map((p) => p[1]);
  //   const padding = 0.01;

  //   // C. Fetch shelters (Prisma + OSM)
  //   const [osmShelters, dbShelters] = await Promise.all([
  //     fetchSheltersNearPath(points),
  //     this.prisma.shelter.findMany({
  //       where: {
  //         lat: {
  //           gte: Math.min(...lats) - padding,
  //           lte: Math.max(...lats) + padding,
  //         },
  //         lng: {
  //           gte: Math.min(...lngs) - padding,
  //           lte: Math.max(...lngs) + padding,
  //         },
  //       },
  //     }),
  //   ]);

  //   // E. Ensure OSM shelters also have x/y before merging
  //   const osmFormatted = osmShelters.map((s: any) => ({
  //     ...s,
  //     x: s.lng || s.x,
  //     y: s.lat || s.y,
  //   }));

  //   // D. Merge and Format
  //   const allShelters = [
  //     ...osmFormatted,
  //     ...dbShelters.map((s) => ({
  //       id: s.id, // Preserve ID
  //       x: s.lng, // Python expects 'x' for lng
  //       y: s.lat, // Python expects 'y' for lat
  //       name: s.name,
  //       address: s.address,
  //       isOfficial: true,
  //     })),
  //   ];

  //   console.log("Calling OSRM with points: start:", start, "end:", end);

  //   // E. Use the new Client for the Python Solver call
  //   const safetyData = await logicServerClient.evaluateRoute(
  //     points,
  //     allShelters,
  //   );

  //   // F. Keep your specific math for unique safe shelters
  //   const safeSheltersCount = new Set(
  //     safetyData.safetyReport
  //       .filter((p: any) => p.s === true)
  //       .map((p: any) => p.name),
  //   ).size;

  //   return {
  //     summary: {
  //       distance: routeData.routes[0].distance,
  //       unit: "km",
  //       safetyScore: safetyData.safetyScore,
  //       safeSheltersCount,
  //     },
  //     routeGeometry: routeData.routes[0].geometry,
  //     safetyReport: safetyData.safetyReport,
  //   };
  // }
}
