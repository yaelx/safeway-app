import React, { createContext, useContext, useState, useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import L from "leaflet";

interface Coords {
  lat: number;
  lng: number;
}

interface LocationContextType {
  coordinates: L.LatLng | null;
  loading: boolean;
  locate: () => void;
  startLocation: Coords | null;
  endLocation: Coords | null;
  setStartLocation: (c: Coords | null) => void;
  setEndLocation: (c: Coords | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { coordinates, loading, locate } = useGeolocation();
  const [startLocation, setStartLocation] = useState<Coords | null>(null);
  const [endLocation, setEndLocation] = useState<Coords | null>(null);

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        loading,
        locate,
        startLocation,
        endLocation,
        setStartLocation,
        setEndLocation,
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
