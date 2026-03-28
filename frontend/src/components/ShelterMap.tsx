/// <reference path="../types/govmap.d.ts" />
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/leaflet.css";
import { TripSearch } from "./TripSearch";
import { useLocationState } from "../context/LocationContext";
import { useRouting } from "../hooks/useRouting";
import { SafeRoute } from "./SafeRoute";
import { UserMarker } from "./UserMarker";
import { UnifiedShelterMarker } from "./UnifiedShelterMarker";
import { RouteColorsArray, TileLayerUrl } from "../config/constants";
import { LocationMarker } from "./LocationMarker";
import { RouteData } from "../types/types";
import { RouteResultsSheet } from "./RouteResultsSheet";

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
        const res = await fetch(`/api/shelters/in-bounds`, {
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
  const { routeData, decodedPaths, loading, planTrip } = useRouting();
  const { coordinates } = useLocationState();
  const [globalShelters, setGlobalShelters] = useState<any[]>([]);
  const { startLocation, endLocation } = useLocationState();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-200">
      <div className="absolute top-0 left-0 z-[2000] p-4 pointer-events-none w-full max-w-sm">
        <TripSearch onPlanTrip={planTrip} loading={loading} />
      </div>

      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[32.0853, 34.7818]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer url={TileLayerUrl} />

          <MapRecenter
            location={
              startLocation
                ? L.latLng(startLocation.coords.lat, startLocation.coords.lng)
                : coordinates
            }
          />
          <MapController points={decodedPaths[0]} />
          {coordinates && <UserMarker coords={coordinates} icon={userIcon} />}
          {routeData &&
            routeData.map((r: RouteData, i: number) => (
              <SafeRoute
                key={i}
                routeData={r}
                path={decodedPaths[i]}
                routeColor={RouteColorsArray[i] || "#64748b"}
              />
            ))}
          <ShelterDiscovery
            onSheltersFetched={setGlobalShelters}
            hasSelection={!!startLocation || !!endLocation}
          />

          {startLocation && !routeData && (
            <LocationMarker markerLocation={startLocation} type="start" />
          )}

          {globalShelters.map((s, i) => (
            <UnifiedShelterMarker key={i} shelter={s} />
          ))}
        </MapContainer>

        {/* {routeData && (
          <div className="z-[3000]">
            <RouteResultsSheet routes={routeData} />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ShelterMap;
