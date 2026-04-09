import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouting } from "../hooks/useRouting";
import { RouteData } from "../types/types";
import polyline from "@mapbox/polyline";

interface RoutingContextType {
  routeData: RouteData[] | null;
  loading: boolean;
  planTrip: (start: any, end: any) => Promise<void>;
  selectedRoute: RouteData | null;
  onSelectRoute: (route: RouteData) => void;
  error: string | null;
  decodedPath: [number, number][] | null;
}

const RoutingContext = createContext<RoutingContextType | undefined>(undefined);

export const RoutingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { routeData, loading, planTrip, error } = useRouting();
  const [decodedPath, setDecodedPath] = useState<[number, number][]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);

  // Auto-select safest route when data arrives
  useEffect(() => {
    if (routeData && routeData.length > 0) {
      setSelectedRoute(routeData[0]);
      setDecodedPath(polyline.decode(routeData[0].geometry));
    }
  }, [routeData]);

  const onSelectRoute = (route: RouteData) => {
    setSelectedRoute(route);
    setDecodedPath(polyline.decode(route.geometry));
  };

  return (
    <RoutingContext.Provider
      value={{
        routeData,
        loading,
        planTrip,
        selectedRoute,
        onSelectRoute,
        decodedPath,
        error,
      }}
    >
      {children}
    </RoutingContext.Provider>
  );
};

export const useRoutingContext = () => {
  const context = useContext(RoutingContext);
  if (!context)
    throw new Error("useRoutingContext must be used within RoutingProvider");
  return context;
};
