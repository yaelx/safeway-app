import { useState } from "react";
import polyline from "@mapbox/polyline";
import { API_ENDPOINTS } from "../config/constants";
import { RouteData, SegmentAnalysis } from "../types/types";

export const useRouting = () => {
  const [routeData, setRouteData] = useState<RouteData[] | null>(null);
  // const [decodedPaths, setDecodedPaths] = useState<[number, number][][]>([]);
  const [loading, setLoading] = useState(false);

  const planTrip = async (start: string, end: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SAFE_ROUTE}?start=${start}&end=${end}`,
      );
      const data = await response.json();

      if (data.routes?.length) {
        // We ensure each segment is decoded immediately when data arrives
        const processedRoutes = data.routes.map((route: RouteData) => ({
          ...route,
          decodedSegments: route.segments.map((seg: SegmentAnalysis) => ({
            coords: polyline.decode(seg.geometry),
            status: seg.status,
            type: seg.type,
          })),
        }));
        setRouteData(processedRoutes);

        // setDecodedPaths(
        //   data.routes.map((r: RouteData) => polyline.decode(r.geometry)),
        // );
      }
    } catch (err) {
      console.error("Safety Analysis Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return { routeData, loading, planTrip };
};
