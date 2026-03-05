/// <reference path="../types/govmap.d.ts" />
import React, { useState, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/leaflet.css";
import { useGovMapLoader } from "../hooks/useGovMapLoader";
import MOCK_SHELTERS from "../mockData/mockShelters";

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
L.Marker.prototype.options.icon = DefaultIcon;

// --- Interfaces ---
interface ShelterData {
  lat: number;
  lng: number;
  name: string;
  address: string;
  distance: number;
}

const API_TOKEN = "YOUR_API_TOKEN";

const ShelterMap: React.FC = () => {
  // 1. Initialize the Loader Guard
  const { isLoaded, error } = useGovMapLoader(API_TOKEN);

  const [shelters, setShelters] = useState<ShelterData[]>([]);
  const [loading, setLoading] = useState(false);

  // 2. The Core Search Logic
  const findNearbyShelters = useCallback(
    async (location: LatLng) => {
      // Safety check: Don't run if SDK isn't ready
      //if (!window.govmap || !isLoaded) return;

      setLoading(true);

      // SIMULATED DELAY (To test your cool CSS spinner)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        let results: ShelterData[] = [];

        if (window.govmap) {
          // A. Convert GPS (WGS84) -> ITM (Israel Network) for the API
          const itmPoint = window.govmap.geoToItm({
            lat: location.lat,
            lng: location.lng,
          });

          const params: govmap.LayerDataParams = {
            LayerName: "layer_bombshelters",
            Point: itmPoint,
            Radius: 1000,
          };

          const response = await window.govmap.getLayerData(params);

          if (response.status === 0 && response.data) {
            results = response.data.map((item: any) => {
              // B. The ignored part: Convert ITM results BACK to GPS for Leaflet
              const gps = window.govmap.itmToGeo({ x: item.x, y: item.y });

              return {
                lat: gps.lat,
                lng: gps.lng,
                name: item.attributes?.["שם_מקלט"] || "Public Shelter",
                address: item.attributes?.["כתובת"] || "Unknown Address",
                distance: item.distance,
              };
            });
          }
        } else {
          // MOCK LOGIC (Runs if SDK isn't loaded yet)
          console.warn("GovMap SDK not found. Using Mock Data.");
          // Create results with coordinates relative to where YOU clicked
          // This ensures they are always visible on your screen
          results = MOCK_SHELTERS.map((item, index) => ({
            lat: location.lat + (index === 0 ? 0.002 : -0.002), // offset slightly
            lng: location.lng + (index === 0 ? 0.002 : -0.002),
            name: item.attributes["שם_מקלט"],
            address: item.attributes["כתובת"],
            distance: item.distance,
          }));
        }

        setShelters(results);
      } catch (err) {
        console.error("GIS Search Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [isLoaded],
  );

  // 3. Leaflet Event Listener
  const MapEventsHandler = () => {
    const map = useMapEvents({
      click(e) {
        findNearbyShelters(e.latlng);
      },
    });

    // Ensures the map tiles recalculate if the window is resized
    useEffect(() => {
      map.invalidateSize();
    }, [map]);

    return null;
  };

  // UI States for Loading/Errors
  if (error)
    return <div className="p-4 bg-red-100 text-red-700">Error: {error}</div>;
  if (!isLoaded) return <div className="p-4">Loading Mapping SDK...</div>;

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Professional Overlay */}
      {loading && (
        <div className="map-loader-overlay">
          <div className="spinner"></div>
          <span className="loader-text">SEARCHING NEARBY SHELTERS...</span>
        </div>
      )}

      <MapContainer
        center={[32.0853, 34.7818]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEventsHandler />

        {shelters.map((s, i) => (
          <Marker key={i} position={[s.lat, s.lng]}>
            <Popup>
              <div style={{ textAlign: "left", minWidth: "150px" }}>
                <h3 style={{ margin: "0 0 5px 0", color: "#0066cc" }}>
                  {s.name}
                </h3>
                <p style={{ margin: "0", fontSize: "13px" }}>{s.address}</p>
                <hr
                  style={{
                    margin: "8px 0",
                    border: "0",
                    borderTop: "1px solid #eee",
                  }}
                />
                <span style={{ fontWeight: "bold", color: "#666" }}>
                  📍 {Math.round(s.distance)} meters away
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ShelterMap;
