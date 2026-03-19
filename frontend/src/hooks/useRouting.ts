import { useState } from "react";
import polyline from "@mapbox/polyline";
import { API_ENDPOINTS } from "../config/constants";

export const useRouting = () => {
  const [routeData, setRouteData] = useState<any>(null);
  const [decodedPath, setDecodedPath] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);

  const planTrip = async (start: string, end: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SAFE_ROUTE}?start=${start}&end=${end}`,
      );
      const data = await response.json();

      if (data.routeGeometry) {
        setDecodedPath(polyline.decode(data.routeGeometry));
        setRouteData(data);
      }
    } catch (err) {
      console.error("Safety Analysis Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return { routeData, decodedPath, loading, planTrip };
};
