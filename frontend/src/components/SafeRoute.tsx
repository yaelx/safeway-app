import { Polyline, Popup } from "react-leaflet";
import { COLORS } from "../config/constants";
import { UnifiedShelterMarker } from "./UnifiedShelterMarker";
import { useLocationState } from "../context/LocationContext";
import { LocationMarker } from "./LocationMarker";
import { RouteData, RoutePoint } from "../types/types";

export const SafeRoute = ({
  routeData,
  path,
}: {
  routeData: RouteData;
  path: [number, number][];
}) => {
  const { startLocation, endLocation } = useLocationState();
  if (!routeData || !path.length) return null;

  return (
    <>
      <Polyline
        positions={path}
        pathOptions={{
          color: routeData.safetyScore > 10 ? COLORS.SAFE : COLORS.WARNING,
          weight: 5,
        }}
      >
        <Popup>
          <div style={{ textAlign: "left" }}>
            <strong>route: {routeData.index + 1}</strong>
            <p>safety score: {routeData.safetyScore} </p>
            <p>distance: {Math.ceil(routeData.distance / 1000)} km</p>
            <p>time: {Math.round(routeData.duration / 60)} min</p>
          </div>
        </Popup>
      </Polyline>

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
