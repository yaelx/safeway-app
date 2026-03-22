import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { SHELTER_COLORS } from "../config/constants";

const getShelterColor = (shelterType: string | undefined) => {
  return typeof shelterType === "string"
    ? SHELTER_COLORS[shelterType as keyof typeof SHELTER_COLORS]
    : SHELTER_COLORS["default"];
};

const createMuiIcon = (color: string) => {
  // Select color based on type, fallback to default

  const iconHTML = renderToStaticMarkup(
    <HealthAndSafetyIcon style={{ fontSize: "30px" }} />,
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
    type?: string;
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
  const markerColor = getShelterColor(shelter.type);

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
