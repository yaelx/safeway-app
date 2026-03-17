// src/hooks/useGeolocation.ts
import { useState, useCallback } from "react";
import L from "leaflet";

interface GeolocationState {
  coordinates: L.LatLng | null;
  loading: boolean;
  error: string | null;
}

const defaultLocation = { lat: 32.0853, lng: 34.7818 };

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
  });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: "Geolocation not supported" }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setState({
          coordinates: new L.LatLng(latitude, longitude),
          loading: false,
          error: null,
        });
      },
      (error) => {
        setState({
          coordinates: null,
          loading: false,
          error: error.message,
        });
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  return { ...state, locate };
};
