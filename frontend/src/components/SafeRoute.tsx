import { Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { UnifiedShelterMarker } from "./UnifiedShelterMarker";
import { useLocationState } from "../context/LocationContext";
import { LocationMarker } from "./LocationMarker";
import { RouteData, RoutePoint } from "../types/types";
import { BRAND_COLORS } from "../theme/theme";

// Helper to map status to color
const getSegmentColor = (status: string, isSelected: boolean) => {
  // If the route is NOT selected, show it in a neutral, muted gray
  if (!isSelected) return "#94a3b8";

  // If SELECTED, show the "Practical" safety colors
  switch (status) {
    case "safe":
      return "#22c55e"; // Vivid Green
    case "caution":
      return "#eab308"; // Vivid Yellow
    case "exposed":
      return "#ef4444"; // Vivid Red
    default:
      return BRAND_COLORS.fastest; // Brand Blue
  }
};

export const SafeRoute = ({
  routeData,
  isSelected,
  setSelectedRoute,
}: {
  routeData: RouteData;
  isSelected: boolean;
  setSelectedRoute: (route: RouteData) => void;
}) => {
  const { startLocation, endLocation } = useLocationState();
  // if (!routeData || !path.length) return null;

  if (!routeData || !routeData.decodedSegments) return null;

  return (
    <>
      {/* 1. Draw the Segments (The Multi-Color Line) */}
      {routeData.decodedSegments.map((segment, idx) => (
        <Polyline
          key={`${routeData.index}-seg-${idx}`}
          positions={segment.coords}
          pathOptions={{
            color: getSegmentColor(segment.status, isSelected),
            // Thinner for background, thicker for the active choice
            weight: isSelected ? 8 : 4,
            // Muted for background
            opacity: isSelected ? 1 : 0.4,
            lineJoin: "round",
            lineCap: "round",
            // This ensures the selected route stays on top of the gray ones
            pane: isSelected ? "overlayPane" : "tilePane",
          }}
          eventHandlers={{
            click: (e: any) => {
              L.DomEvent.stopPropagation(e);
              setSelectedRoute(routeData);
            },
          }}
        />
      ))}

      <LocationMarker markerLocation={startLocation} type="start" />
      <LocationMarker markerLocation={endLocation} type="end" />

      {/* 2. Draw Shelters based on the new segments data */}
      {/* Only show these markers for the SELECTED route to keep the map clean */}
      {isSelected && (
        <>
          {routeData.segments
            .flatMap((seg) => seg.shelters)
            .map((shelter, i) => (
              <UnifiedShelterMarker
                key={`sh-${shelter.id}-${i}`}
                shelter={shelter}
              />
            ))}

          {routeData.segments.map(
            (seg, i) =>
              seg.escapePoint && (
                <Popup
                  position={[seg.escapePoint.lat, seg.escapePoint.lng]}
                  key={`esc-${i}`}
                >
                  <div className="text-xs">
                    <p className="font-bold text-red-600">Emergency Escape</p>
                    <p>{seg.escapePoint.name}</p>
                  </div>
                </Popup>
              ),
          )}
        </>
      )}
    </>
  );
};
