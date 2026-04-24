import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "../config/constants";
import { decodeSecurePayload } from "../utils/security";

export const useShelters = (bounds: any, enabled: boolean) => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSheltersWithSecurity = useCallback(async (bounds: any) => {
    const payload = {
      minLat: bounds.getSouthWest().lat,
      maxLat: bounds.getNorthEast().lat,
      minLng: bounds.getSouthWest().lng,
      maxLng: bounds.getNorthEast().lng,
    };
    const res = await fetch(API_ENDPOINTS.SHELTERS_IN_BOUNDS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const arrayBuffer = await res.arrayBuffer();
    const timeKey = res.headers.get("X-Key-Time") || "";
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return decodeSecurePayload(base64, timeKey);
  }, []);

  useEffect(() => {
    if (!enabled || !bounds) return;

    // The hook handles the race condition automatically using the isMounted flag
    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await fetchSheltersWithSecurity(bounds);
        if (isMounted) {
          setShelters(data.shelters || []);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
        console.error("Discovery error:", e);
      }
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [bounds.toString(), enabled]);

  return { shelters, loading };
};
