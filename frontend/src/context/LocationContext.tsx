import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import { locateWithRetry } from "../hooks/useGeolocation";

import { Location } from "../types/types";

interface LocationContextType {
  startLocation: Location | null;
  endLocation: Location | null;
  setStartLocation: (c: Location | null) => void;
  setEndLocation: (c: Location | null) => void;
  locating: boolean;
  locationError: string | null;
  handleLocateMe: (target: "start" | "end") => void;
  cancelLocate: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelLocate = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleLocateMe = useCallback(async (target: "start" | "end") => {
    // Cancel any in-flight locate
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLocating(true);
    setLocationError(null);

    try {
      const position = await locateWithRetry(controller.signal);
      const loc: Location = {
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        address: "Current Location",
      };

      if (target === "start") setStartLocation(loc);
      else setEndLocation(loc);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return; // silent
      setLocationError("Could not get your location. Please try again.");
    } finally {
      setLocating(false);
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        startLocation,
        endLocation,
        setStartLocation,
        setEndLocation,
        locating,
        locationError,
        handleLocateMe,
        cancelLocate,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationState = () => {
  const context = useContext(LocationContext);
  if (!context)
    throw new Error("useLocationState must be used within LocationProvider");
  return context;
};
