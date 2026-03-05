/// <reference path="../types/govmap.d.ts" />
import React, { useState, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  Circle,
} from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/leaflet.css";
import { useGovMapLoader } from "../hooks/useGovMapLoader";
import { useGeolocation } from "../hooks/useGeolocation";
import generateMockShelters from "../mockData/mockShelters";

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

// Create the custom pulsing icon
const userIcon = L.divIcon({
  className: "user-location-marker",
  html: '<div class="user-location-dot"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// --- Interfaces ---
interface ShelterData {
  lat: number;
  lng: number;
  name: string;
  address: string;
  distance: number;
}

const API_TOKEN = "YOUR_API_TOKEN";

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

const ShelterMap: React.FC = () => {
  // 1. Initialize the Loader Guard
  const { isLoaded, error: loaderError } = useGovMapLoader(API_TOKEN);
  const {
    coordinates,
    loading: geoLoading,
    error: geoError,
    locate,
  } = useGeolocation();

  const [shelters, setShelters] = useState<govmap.ShelterResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Automatically search when coordinates change (from "Locate Me")
  useEffect(() => {
    if (coordinates) {
      findNearbyShelters(coordinates);
    }
  }, [coordinates]);

  // Combine them for the UI Overlay
  // If we are finding the GPS OR searching the DB, show the spinner
  const isGlobalLoading = geoLoading || searchLoading;

  const findNearbyShelters = useCallback(async (latlng: L.LatLng) => {
    console.log("Map clicked at:", latlng); // DEBUG 1
    setSearchLoading(true);

    try {
      // Force a delay to see the spinner
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSearchLoading(true);

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = generateMockShelters(latlng);
      setShelters(mockData);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // 2. The Core Search Logic
  // const findNearbyShelters = useCallback(
  //   async (location: LatLng) => {
  //     // Safety check: Don't run if SDK isn't ready
  //     if (!window.govmap || !isLoaded) return;

  //     setLoading(true);

  //     try {
  //       let results: ShelterData[] = [];
  //         // A. Convert GPS (WGS84) -> ITM (Israel Network) for the API
  //         const itmPoint = window.govmap.geoToItm({
  //           lat: location.lat,
  //           lng: location.lng,
  //         });

  //         const params: govmap.LayerDataParams = {
  //           LayerName: "layer_bombshelters",
  //           Point: itmPoint,
  //           Radius: 1000,
  //         };

  //         const response = await window.govmap.getLayerData(params);

  //         if (response.status === 0 && response.data) {
  //           results = response.data.map((item: any) => {
  //             // B. The ignored part: Convert ITM results BACK to GPS for Leaflet
  //             const gps = window.govmap.itmToGeo({ x: item.x, y: item.y });

  //             return {
  //               lat: gps.lat,
  //               lng: gps.lng,
  //               name: item.attributes?.["שם_מקלט"] || "Public Shelter",
  //               address: item.attributes?.["כתובת"] || "Unknown Address",
  //               distance: item.distance,
  //             };
  //           });
  //         }
  //       setShelters(results);
  //     } catch (err) {
  //       console.error("GIS Search Error:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [isLoaded],
  // );

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
  if (loaderError)
    return (
      <div className="p-4 bg-red-100 text-red-700">Error: {loaderError}</div>
    );
  if (!isLoaded) return <div className="p-4">Loading Mapping SDK...</div>;

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* 1. Locate Button - Disabled while loading */}
      <button
        className="locate-button"
        onClick={locate}
        disabled={isGlobalLoading}
      >
        <span style={{ fontSize: "18px" }}>🎯</span>
        <span>{geoLoading ? "Finding you..." : "Find Shelters Near Me"}</span>
      </button>

      {/* 2. Professional Overlay - Now reacts to both states */}
      {isGlobalLoading && (
        <div className="map-loader-overlay">
          <div className="spinner"></div>
          <span className="loader-text">
            {geoLoading ? "LOCATING YOU..." : "SEARCHING NEARBY SHELTERS..."}
          </span>
        </div>
      )}

      <MapContainer
        center={[32.0853, 34.7818]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Helper to fly the map to the coordinates */}
        <MapRecenter location={coordinates} />

        <MapEventsHandler />

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

        {shelters.map((s, i) => (
          <Marker key={i} position={[s.y, s.x]}>
            <Popup>
              <div style={{ textAlign: "left", minWidth: "150px" }}>
                <h3 style={{ margin: "0 0 5px 0", color: "#0066cc" }}>
                  {s.attributes["שם_מקלט"]}
                </h3>
                <p style={{ margin: "0", fontSize: "13px" }}>
                  {s.attributes["כתובת"]}
                </p>
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
