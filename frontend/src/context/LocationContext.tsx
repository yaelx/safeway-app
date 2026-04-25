import React, { createContext, useContext, useState, useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import L from "leaflet";
import { Location } from "../types/types";

interface LocationContextType {
  coordinates: L.LatLng | null;
  loading: boolean;
  handleLocateMe: (target: "start" | "end") => void;
  startLocation: Location | null;
  endLocation: Location | null;
  setStartLocation: (c: Location | null) => void;
  setEndLocation: (c: Location | null) => void;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { locate, loading, error } = useGeolocation();
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);

  const handleLocateMe = async (target: "start" | "end" = "start") => {
    try {
      // 1. Await the locate() call.
      // Note: If locate() doesn't return a promise, update it to return the LatLng.
      const pos = await locate();

      if (pos) {
        const loc: Location = {
          coords: { lat: pos.lat, lng: pos.lng },
          address: "Current Location",
        };

        // 2. Set the state immediately after getting the location
        if (target === "start") {
          setStartLocation(loc);
        } else {
          setEndLocation(loc);
        }
      }
    } catch (err) {
      console.error("User refused location or GPS error:", err);
      // Optional: Update global state with error to show a Toast/Alert
    }
  };

  return (
    <LocationContext.Provider
      value={{
        coordinates: null,
        loading,
        handleLocateMe,
        startLocation,
        endLocation,
        setStartLocation,
        setEndLocation,
        error,
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
