import React, { createContext, useContext, useState, useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import L from "leaflet";
import { Location } from "../types/types";

interface LocationContextType {
  coordinates: L.LatLng | null;
  loading: boolean;
  handleLocateMe: () => void;
  startLocation: Location | null;
  endLocation: Location | null;
  setStartLocation: (c: Location | null) => void;
  setEndLocation: (c: Location | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { coordinates, loading, locate } = useGeolocation();
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);

  // Auto-sync GPS to Start Location once discovered
  useEffect(() => {
    if (coordinates && !startLocation) {
      setStartLocation({
        coords: { lat: coordinates.lat, lng: coordinates.lng },
        address: "Current Location",
      } as Location);
    }
  }, [coordinates]);

  // Handle "My Location" Click
  const handleLocateMe = () => {
    locate();
    if (coordinates) {
      setStartLocation({
        coords: { lat: coordinates.lat, lng: coordinates.lng },
        address: "Current Location",
      } as Location);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        loading,
        handleLocateMe,
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
