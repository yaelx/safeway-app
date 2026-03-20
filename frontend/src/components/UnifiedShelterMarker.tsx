import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { SHELTER_COLORS } from "../config/constants";

// Helper to create the MUI icon
const createMuiIcon = (color: string) => {
  const iconHTML = renderToStaticMarkup(
    <HealthAndSafetyIcon style={{ color: color, fontSize: "30px" }} />,
  );
  return L.divIcon({
    html: `<div style="display: flex; justify-content: center;">${iconHTML}</div>`,
    className: "custom-mui-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface UnifiedShelterProps {
  shelter: {
    lat: number;
    lng: number;
    d?: number; // distance in meters
    s?: boolean; // is safe
    name?: string;
    address?: string;
    isOfficial?: boolean;
  };
  isRoutePoint?: boolean;
}

export const UnifiedShelterMarker: React.FC<UnifiedShelterProps> = ({
  shelter,
  isRoutePoint,
}) => {
  // 1. Robust Coordinate Extraction (Handles both DB and OSM formats)

  // 2. Guard Clause: Skip if data is corrupted
  if (shelter.lat === undefined || shelter.lng === undefined) return null;

  // 3. Determine Color based on Source
  let markerColor = SHELTER_COLORS.COMMUNITY;
  if (isRoutePoint) markerColor = SHELTER_COLORS.ROUTE_SAFE;
  else if (shelter.isOfficial) markerColor = SHELTER_COLORS.OFFICIAL;

  return (
    <Marker
      position={[shelter.lat, shelter.lng]}
      icon={createMuiIcon(markerColor)}
    >
      <Popup>
        <div style={{ textAlign: "right", direction: "rtl" }}>
          <strong>{shelter.name || "מקלט"}</strong>
          <br />
          {shelter.address && (
            <small>
              {shelter.address}
              <br />
            </small>
          )}
          {shelter.d && (
            <small>
              {Math.round(shelter.d / 10)} מטר
              <br />
            </small>
          )}
          <span style={{ color: markerColor, fontWeight: "bold" }}>
            {shelter.isOfficial ? "✅ מקלט רשמי" : "📍 דיווח קהילתי"}
          </span>
        </div>
      </Popup>
    </Marker>
  );
};
