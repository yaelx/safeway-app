/// <reference path="../types/govmap.d.ts" />
import React, { useState, useCallback, useEffect } from "react";
import polyline from "@mapbox/polyline";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  Circle,
  Polyline,
} from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/leaflet.css";
import { useGovMapLoader } from "../hooks/useGovMapLoader";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { renderToStaticMarkup } from "react-dom/server";
import { TripSearch } from "./TripSearch";
import { useLocationState } from "../context/LocationContext";
import StraightenIcon from "@mui/icons-material/Straighten";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const DefaultIcon = L.icon({
  // Use the direct paths from the node_modules via CDN or public folder
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const createMuiIcon = (color: string) => {
  const iconHTML = renderToStaticMarkup(
    <HealthAndSafetyIcon
      color="primary"
      style={{ color: color, fontSize: "30px" }}
    />,
  );

  return L.divIcon({
    html: `<div style="display: flex; justify-content: center; align-items: center;">${iconHTML}</div>`,
    className: "custom-mui-icon", // Clear default leaflet styles
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

L.Marker.prototype.options.icon = DefaultIcon;

// Create the custom pulsing icon
const userIcon = L.divIcon({
  className: "user-location-marker",
  html: '<div class="user-location-dot"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const API_TOKEN = "YOUR_API_TOKEN";

interface DiscoveryProps {
  onSheltersFetched: (s: any[]) => void;
  hasSelection: boolean; // True if start or end is set
}

const ShelterDiscovery = ({
  onSheltersFetched,
  hasSelection,
}: DiscoveryProps) => {
  const map = useMapEvents({
    moveend: () => {
      // We don't fetch here directly anymore
    },
  });

  useEffect(() => {
    // 1. EXIT EARLY if no points are selected
    if (!hasSelection) {
      console.log("Discovery skipped: No points selected yet.");
      return;
    }

    // Only fetch if selection exists AND we are zoomed in enough
    if (map.getZoom() < 12) {
      console.log("Zoom in more to see shelters");
      return;
    }

    // 2. Setup a timer to fire after 500ms of inactivity
    const timer = setTimeout(async () => {
      const bounds = map.getBounds();
      const payload = {
        minLat: bounds.getSouthWest().lat,
        maxLat: bounds.getNorthEast().lat,
        minLng: bounds.getSouthWest().lng,
        maxLng: bounds.getNorthEast().lng,
      };

      try {
        const res = await fetch(`/api/shelters-in-bounds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        onSheltersFetched(data.shelters || []);
      } catch (e) {
        console.error("Discovery error:", e);
      }
    }, 800); // 800ms delay is safer for Overpass

    // 3. Cleanup: If the user moves the map again before 800ms, cancel the previous timer
    return () => clearTimeout(timer);
  }, [map.getBounds().toString(), hasSelection]); // Only re-run if bounds actually change

  return null;
};

const MapRecenter = ({ location }: { location: L.LatLng | null }) => {
  const map = useMap(); // useMap is a hook provided by react-leaflet
  useEffect(() => {
    if (location) {
      map.flyTo(location, 16, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [location, map]);

  return null;
};

// This component has no UI, it just controls the camera
const MapController = ({ points }: { points: [number, number][] }) => {
  const map = useMap(); // This hook ONLY works inside <MapContainer>

  useEffect(() => {
    if (points && points.length > 0) {
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (err) {
        console.error("Autocentering failed:", err);
      }
    }
  }, [points, map]);

  return null;
};

const ShelterMap: React.FC = () => {
  // 1. Initialize the Loader Guard
  const { isLoaded, error: loaderError } = useGovMapLoader(API_TOKEN);
  const { startLocation, endLocation } = useLocationState();
  const { coordinates, locate } = useLocationState();
  const [routeData, setRouteData] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [decodedPath, setDecodedPath] = useState<[number, number][]>([]); // Stores the coordinates
  const [globalShelters, setGlobalShelters] = useState<any[]>([]);

  // 1. The New API Caller
  const handlePlanTrip = async (start: string, end: string) => {
    setSearchLoading(true);
    try {
      // Calling your new Node Orchestrator
      const response = await fetch(
        `/api/get-safe-route?start=${start}&end=${end}`,
      );
      const data = await response.json();

      console.log("Backend Verified:", data);

      if (data.routeGeometry) {
        const decoded = polyline.decode(data.routeGeometry);
        console.log("Decoded Path:", decoded);
        setDecodedPath(decoded);
        setRouteData(data);
      }
    } catch (err) {
      console.error("Safety Analysis Failed:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // UI States for Loading/Errors
  if (loaderError)
    return (
      <div className="p-4 bg-red-100 text-red-700">Error: {loaderError}</div>
    );
  if (!isLoaded) return <div className="p-4">Loading Mapping SDK...</div>;

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <TripSearch onPlanTrip={handlePlanTrip} loading={searchLoading} />

      <div style={{ height: "100vh", width: "100%", position: "relative" }}>
        <MapContainer
          center={[32.0853, 34.7818]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* Helper to fly the map to the coordinates */}
          <MapRecenter location={coordinates} />

          {/* 2. Fly the camera to the new route */}
          <MapController points={decodedPath} />

          {/* <MapEventsHandler /> */}

          {/* 2. Draw the Route Geometry from the Backend */}
          {decodedPath.length > 0 && (
            <Polyline
              positions={decodedPath}
              pathOptions={{
                color:
                  routeData.summary.safetyScore > 10 ? "#2ecc71" : "#f39c12",
                weight: 4,
              }}
            >
              <Popup>
                <div
                  style={{
                    minWidth: "200px",
                    direction: "rtl",
                    textAlign: "right",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      borderBottom: "1px solid #ccc",
                    }}
                  >
                    סיכום מסלול בטוח 🛡️
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <StraightenIcon
                      style={{ marginLeft: "8px", color: "#666" }}
                    />
                    <span>
                      מרחק כולל:{" "}
                      <strong>
                        {(routeData.summary.distance / 1000).toFixed(2)}
                        {routeData.summary.unit}
                      </strong>
                    </span>
                  </div>

                  {/* Number of Shelters found along the route */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <HealthAndSafetyIcon
                      style={{ marginLeft: "8px", color: "#2e7d32" }}
                    />
                    <span>
                      מקלט זמינים בדרך:{" "}
                      <strong>
                        {routeData.safetyReport.filter((p: any) => p.s).length}
                      </strong>
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <HealthAndSafetyIcon
                      style={{ marginLeft: "8px", color: "#2e7d32" }}
                    />
                    <span>
                      ציון בטיחות:{" "}
                      <strong>
                        {routeData.summary.safetyScore.toFixed(2)}
                      </strong>
                    </span>
                  </div>
                </div>
              </Popup>
            </Polyline>
          )}

          {/* User Location Marker */}
          {coordinates && (
            <>
              <Circle
                center={coordinates}
                radius={5000}
                pathOptions={{
                  color: "#4285F4",
                  fillColor: "#4285F4",
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: "5, 5", // Makes the border dashed for a "searching" look
                }}
              />
              <Marker position={coordinates} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
            </>
          )}

          {/* 3. Draw Shelters used in the specific safety calculation */}
          {routeData?.safetyReport?.map(
            (point: any, i: number) =>
              // Only show markers for points that the Python brain flagged as "Safe"
              point.s && (
                <Marker
                  key={`point-${i}`}
                  position={point.p} // point.p should be [lat, lng]
                  icon={DefaultIcon}
                >
                  <Popup>Distance: {point.d.toFixed(1)}m</Popup>
                </Marker>
              ),
          )}

          <ShelterDiscovery
            onSheltersFetched={setGlobalShelters}
            hasSelection={!!startLocation || !!endLocation}
          />
          {globalShelters.map((s, i) => (
            <Marker
              key={i}
              position={[s.y, s.x]}
              icon={createMuiIcon("#0288d1")}
            >
              <Popup>
                <div style={{ textAlign: "left", minWidth: "150px" }}>
                  <h3 style={{ margin: "0 0 5px 0", color: "#0066cc" }}>
                    {`מקלט מס׳: ${s.id} ${s.name !== "ריק" ? s.name : ""} `}
                  </h3>
                  <hr
                    style={{
                      margin: "8px 0",
                      border: "0",
                      borderTop: "1px solid #eee",
                    }}
                  />
                  {s.address && (
                    <span>
                      {s.address}
                      <br />
                    </span>
                  )}
                  <small>
                    {s.isOfficial
                      ? "✅ Verified Shelter"
                      : "📍 Community Mapped"}
                  </small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default ShelterMap;
