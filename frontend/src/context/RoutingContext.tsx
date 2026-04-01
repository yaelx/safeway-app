import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouting } from "../hooks/useRouting";
import { RouteData } from "../types/types";

interface RoutingContextType {
  routeData: RouteData[] | null;
  decodedPaths: [number, number][][];
  loading: boolean;
  planTrip: (start: any, end: any) => Promise<void>;
  selectedRoute: RouteData | null;
  setSelectedRoute: (route: RouteData) => void;
}

const RoutingContext = createContext<RoutingContextType | undefined>(undefined);

export const RoutingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { routeData, decodedPaths, loading, planTrip } = useRouting();
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);

  // Auto-select safest route when data arrives
  useEffect(() => {
    if (routeData && routeData.length > 0) {
      setSelectedRoute(routeData[0]);
    }
  }, [routeData]);

  return (
    <RoutingContext.Provider
      value={{
        routeData,
        decodedPaths,
        loading,
        planTrip,
        selectedRoute,
        setSelectedRoute,
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
