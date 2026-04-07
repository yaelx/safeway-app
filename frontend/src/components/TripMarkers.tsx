import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import FlagIcon from "@mui/icons-material/Flag";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { TripMarkersStrings } from "../config/constants";
import { BRAND_COLORS } from "../theme/theme";

const createTripIcon = (Component: React.ElementType, color: string) => {
  const iconHTML = renderToStaticMarkup(
    <Component style={{ color: color, fontSize: "34px" }} />,
  );

  return L.divIcon({
    html: `<div className="drop-shadow-md">${iconHTML}</div>`,
    className: "trip-marker-icon", // Tailwind handles drop-shadow here
    iconSize: [34, 34],
    iconAnchor: [17, 34], // Bottom center of the icon
  });
};

interface TripMarkersProps {
  path: [number, number][]; // The decoded polyline
}

export const TripMarkers: React.FC<TripMarkersProps> = ({ path }) => {
  if (!path || path.length < 2) return null;

  const startPoint = path[0];
  const endPoint = path[path.length - 1];

  return (
    <>
      {/* Start Marker */}
      <Marker
        position={startPoint}
        icon={createTripIcon(LocationOnIcon, BRAND_COLORS.startMarker)}
      >
        <Popup>{TripMarkersStrings.PopupStartPoint}</Popup>
      </Marker>

      {/* End Marker */}
      <Marker
        position={endPoint}
        icon={createTripIcon(FlagIcon, BRAND_COLORS.endMarker)}
      >
        <Popup>{TripMarkersStrings.PopupEndPoint}</Popup>
      </Marker>
    </>
  );
};
