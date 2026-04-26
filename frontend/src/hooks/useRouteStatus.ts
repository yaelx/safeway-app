import { useState, useEffect, useRef } from "react";
import polyline from "@mapbox/polyline";
import { API_ENDPOINTS } from "../config/constants";
import { RouteData, SegmentAnalysis } from "../types/types";
import { ably } from "../lib/ably"; // We'll create this helper
import { decodeAblyMessage } from "../utils/security";

export const useRouting = () => {
  const [routeData, setRouteData] = useState<RouteData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // We use a ref to track the current subscription so we can clean it up
  const channelRef = useRef<any>(null);

  const processRoutes = (routes: RouteData[]) => {
    return routes.map((route) => ({
      ...route,
      decodedSegments: route.segments.map((seg: SegmentAnalysis) => ({
        coords: polyline.decode(seg.geometry),
        status: seg.status,
        type: seg.type,
      })),
    }));
  };

  useEffect(() => {
    return () => {
      // If the component unmounts, stop listening and clean up the ref
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current.detach();
      }
    };
  }, []);

  const planTrip = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    setRouteData(null);
    setStatusMessage("Initializing request...");

    try {
      // 1. Trigger the request (Node returns { requestId, status: 'accepted' })
      const response = await fetch(
        `${API_ENDPOINTS.SAFE_ROUTE}?start=${start}&end=${end}`,
      );
      const initialData = await response.json();

      if (!initialData.requestId) {
        throw new Error("Failed to initialize safety analysis.");
      }

      const requestId = initialData.requestId;

      // 2. Connect to Ably for this specific requestId
      const channel = ably.channels.get(`route-status:${requestId}`);
      channelRef.current = channel;

      // Listen for Status Updates (e.g., "Processing")
      channel.subscribe("status_update", (msg: any) => {
        setStatusMessage(msg.data.message || "Calculating safety...");
      });

      // Listen for the Final Result
      channel.subscribe("result_ready", async (msg: any) => {
        const routes = await decodeAblyMessage(msg);
        if (routes && routes.length) {
          setRouteData(processRoutes(routes));
        } else {
          setError("No safe routes found.");
        }

        setLoading(false);
        channel.unsubscribe(); // Cleanup
      });
    } catch (err) {
      console.error("Pipeline Error:", err);
      setError("Analysis Failed");
      setLoading(false);
    }
  };

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) channelRef.current.unsubscribe();
    };
  }, []);

  return { routeData, loading, planTrip, error, statusMessage };
};
