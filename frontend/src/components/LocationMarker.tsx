import PlaceIcon from "@mui/icons-material/Place";
import React from "react";
import { Marker, Popup } from "react-leaflet";
import FlagIcon from "@mui/icons-material/FlagRounded";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Location } from "../types/types";
import { BRAND_COLORS } from "../theme/theme";

const createTripIcon = (Component: React.ElementType, color: string) => {
  const iconHTML = renderToStaticMarkup(
    <Component style={{ color: color, fontSize: "34px" }} />,
  );

  return L.divIcon({
    html: `
      <div style="
        display: flex; 
        justify-content: center; 
        color: ${color}; 
        fill: ${color};
      ">
        ${iconHTML}
      </div>`,
    className: "trip-marker-icon", // Tailwind handles drop-shadow here
    iconSize: [34, 34],
    iconAnchor: [17, 34], // Bottom center of the icon
  });
};

interface TripMarkersProps {
  markerLocation: Location | null;
  type: "start" | "end";
}

export const LocationMarker: React.FC<TripMarkersProps> = ({
  markerLocation,
  type,
}) => {
  if (!markerLocation) return null;
  return (
    <Marker
      position={L.latLng(markerLocation.coords.lat, markerLocation.coords.lng)}
      icon={
        type === "start"
          ? createTripIcon(PlaceIcon, BRAND_COLORS.startMarker)
          : createTripIcon(FlagIcon, BRAND_COLORS.endMarker)
      } // Blue-500
    >
      <Popup>{markerLocation.address}</Popup>
    </Marker>
  );
};
