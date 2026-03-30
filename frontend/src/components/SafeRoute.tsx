import { Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { UnifiedShelterMarker } from "./UnifiedShelterMarker";
import { useLocationState } from "../context/LocationContext";
import { LocationMarker } from "./LocationMarker";
import { RouteData, RoutePoint } from "../types/types";

export const SafeRoute = ({
  routeData,
  path,
  routeColor,
  isSelected,
  setSelectedRoute,
}: {
  routeData: RouteData;
  path: [number, number][];
  routeColor: string;
  isSelected: boolean;
  setSelectedRoute: (route: RouteData) => void;
}) => {
  const { startLocation, endLocation } = useLocationState();
  if (!routeData || !path.length) return null;

  return (
    <>
      <Polyline
        positions={path}
        pathOptions={{
          color: routeColor,
          weight: isSelected ? 7 : 5,
          opacity: isSelected ? 1 : 0.4,
          lineJoin: "round",
        }}
        eventHandlers={{
          click: (e: any) => {
            L.DomEvent.stopPropagation(e);
            setSelectedRoute(routeData);
          },
        }}
        interactive={true}
      />

      <LocationMarker markerLocation={startLocation} type="start" />
      <LocationMarker markerLocation={endLocation} type="end" />

      {routeData.safetyReport
        .filter((point: RoutePoint) => point.s === true)
        .map((point: RoutePoint, i: number) => (
          <UnifiedShelterMarker
            key={`route-safe-${i}`}
            shelter={{
              ...point,
              lat: point.p[0],
              lng: point.p[1],
            }}
            isRoutePoint={true}
          />
        ))}
    </>
  );
};
