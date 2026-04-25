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

  const getUserLocation = async (
    retries = 3,
    delay = 1000,
  ): Promise<GeolocationPosition> => {
    try {
      return await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000, // Shorter individual timeout for faster retries
          maximumAge: 0,
        });
      });
    } catch (err: any) {
      if (retries > 0) {
        console.warn(
          `Location attempt failed. Retrying in ${delay}ms... (${retries} attempts left)`,
        );
        await new Promise((res) => setTimeout(res, delay));
        // Exponential backoff: double the delay for the next attempt
        return getUserLocation(retries - 1, delay * 2);
      }
      throw err;
    }
  };

  const locate = useCallback(async (): Promise<L.LatLng | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const position = await getUserLocation();
      const coords = new L.LatLng(
        position.coords.latitude,
        position.coords.longitude,
      );

      setState({ coordinates: coords, loading: false, error: null });
      return coords;
    } catch (err: any) {
      setState({
        coordinates: null,
        loading: false,
        error: "Location service unavailable after multiple attempts.",
      });
      return null;
    }
  }, []);

  return { ...state, locate };
};
