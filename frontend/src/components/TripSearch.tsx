import React, { useState, useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useLocationState } from "../context/LocationContext";
import { useAddressSearch } from "../hooks/useAddressSearch";

interface Coords {
  lat: number;
  lng: number;
  display_name?: string;
}

interface TripSearchProps {
  onPlanTrip: (start: string, end: string) => void;
  loading: boolean;
}

export const TripSearch: React.FC<TripSearchProps> = ({
  onPlanTrip,
  loading,
}) => {
  const { coordinates, locate } = useLocationState();

  // Use the custom hook for both inputs
  const fromSearch = useAddressSearch();
  const toSearch = useAddressSearch();

  const { startLocation, setStartLocation, endLocation, setEndLocation } =
    useLocationState();

  // Sync "My Location" from Context to the 'from' hook
  useEffect(() => {
    if (coordinates) {
      setStartLocation({ lat: coordinates.lat, lng: coordinates.lng });
      fromSearch.setQuery("My Current Location");
    }
  }, [coordinates]);

  const handleStartPlan = () => {
    if (startLocation && endLocation) {
      onPlanTrip(
        `${startLocation.lng},${startLocation.lat}`,
        `${endLocation.lng},${endLocation.lat}`,
      );
    }
  };

  return (
    <div className="trip-search-card">
      <h3>🛡️ SafeWay Navigator</h3>

      {/* From Input */}
      <div className="input-group">
        <input
          placeholder="From..."
          value={fromSearch.query}
          onChange={(e) => fromSearch.setQuery(e.target.value)}
        />
        <button onClick={locate} className="small-locate-btn">
          🎯
        </button>
        {fromSearch.results.length > 0 && (
          <ul className="results-dropdown">
            {fromSearch.results.map((r) => (
              <li
                key={r.place_id}
                onClick={() => {
                  setStartLocation({ lat: Number(r.lat), lng: Number(r.lon) });
                  fromSearch.selectAddress(r.display_name); // Use selection lock
                }}
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* To Input */}
      <div className="input-group">
        <input
          placeholder="To..."
          value={toSearch.query}
          onChange={(e) => toSearch.setQuery(e.target.value)}
        />
        {toSearch.results.length > 0 && (
          <ul className="results-dropdown">
            {toSearch.results.map((r) => (
              <li
                key={r.place_id}
                onClick={() => {
                  setEndLocation({ lat: Number(r.lat), lng: Number(r.lon) });
                  toSearch.selectAddress(r.display_name); // Use selection lock
                }}
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleStartPlan}
        disabled={loading || !startLocation || !endLocation}
      >
        {loading ? "Analyzing..." : "Plan Safe Route"}
      </button>
    </div>
  );
};
