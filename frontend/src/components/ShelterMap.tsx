/// <reference path="../types/govmap.d.ts" />
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { TripSearch } from "./TripSearch";
import { useLocationState } from "../context/LocationContext";
import { SafeRoute } from "./SafeRoute";
import { UserMarker } from "./UserMarker";
import { UnifiedShelterMarker } from "./UnifiedShelterMarker";
import { TileLayerUrl } from "../config/constants";
import { LocationMarker } from "./LocationMarker";
import { NavigationPanel } from "./NavigationPanel";
import { useRoutingContext } from "../context/RoutingContext";
import { RouteData } from "../types/types";
import { useShelters } from "../hooks/useShelters";
import CarSpinner from "./CarSpinner";

const DefaultIcon = L.icon({
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

const MapBoundsUpdater = ({
  onBoundsChange,
}: {
  onBoundsChange: (b: any) => void;
}) => {
  useMapEvents({
    moveend: (e) => onBoundsChange(e.target.getBounds()),
    zoomend: (e) => onBoundsChange(e.target.getBounds()),
  });
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
  const map = useMap();

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
  const {
    routeData,
    selectedRoute,
    onSelectRoute,
    decodedPath,
    loading,
    statusMessage,
  } = useRoutingContext();
  const { startLocation, coordinates } = useLocationState();
  const [globalShelters, setGlobalShelters] = useState<any[]>([]);
  const [bounds, setBounds] = useState<any>(null);
  const { shelters, loading: sheltersLoading } = useShelters(
    bounds,
    !!startLocation,
  );

  useEffect(() => {
    setGlobalShelters(shelters);
  }, [shelters]);

  useEffect(() => {
    if (routeData && routeData.length > 0 && !selectedRoute) {
      onSelectRoute(routeData[0]); // Auto-select the first (safest) route
    }
  }, [routeData, selectedRoute]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-brand-black">
      {/* TripSearch Overlay */}
      <div className="absolute top-0 left-0 z-[1001] p-4 pointer-events-none w-full max-w-sm">
        <TripSearch />
      </div>

      {loading && (
        <div className="absolute top-40 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur px-6 py-4 rounded-full shadow-lg border border-blue-100">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
          <span className="text-sm font-medium text-slate-700">
            {statusMessage}
          </span>
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[32.0853, 34.7818]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          className="bg-brand-dark"
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
          <MapBoundsUpdater onBoundsChange={setBounds} />
          <MapController points={decodedPath || []} />
          {coordinates && <UserMarker coords={coordinates} icon={userIcon} />}
          {routeData &&
            [...routeData].map((r: RouteData, i: number) => (
              <SafeRoute
                key={i}
                routeData={r}
                isSelected={selectedRoute?.index === r.index}
                onSelectRoute={onSelectRoute}
              />
            ))}
          {/* {startLocation && !routeData && (
            <LocationMarker markerLocation={startLocation} type="start" />
          )} */}
          {sheltersLoading && <CarSpinner />}
          {globalShelters &&
            globalShelters.map((s, i) => (
              <UnifiedShelterMarker key={i} shelter={s} />
            ))}
        </MapContainer>

        <NavigationPanel />
      </div>
    </div>
  );
};

export default ShelterMap;
