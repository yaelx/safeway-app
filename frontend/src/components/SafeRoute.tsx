import { Polyline } from "react-leaflet";
import { COLORS } from "../config/constants";
import { UnifiedShelterMarker } from "./UnifiedShelterMarker";
import { useLocationState } from "../context/LocationContext";
import { LocationMarker } from "./LocationMarker";

export const SafeRoute = ({
  routeData,
  path,
}: {
  routeData: any;
  path: [number, number][];
}) => {
  const { startLocation, endLocation } = useLocationState();
  if (!routeData || !path.length) return null;

  return (
    <>
      <Polyline
        positions={path}
        pathOptions={{
          color:
            routeData.summary.safetyScore > 10 ? COLORS.SAFE : COLORS.WARNING,
          weight: 5,
        }}
      />
      <LocationMarker markerLocation={startLocation} type="start" />
      <LocationMarker markerLocation={endLocation} type="end" />

      {routeData.safetyReport
        .filter((point: any) => point.s === true)
        .map((point: any, i: number) => (
          <UnifiedShelterMarker
            key={`route-safe-${i}`}
            shelter={{
              ...point,
              lat: point.lat ?? point.p[0],
              lng: point.lng ?? point.p[1],
            }}
            isRoutePoint={true}
          />
        ))}
    </>
  );
};
