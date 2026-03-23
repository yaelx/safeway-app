import React, { useState, useEffect } from "react";
import { useLocationState } from "../context/LocationContext";
import { useAddressSearch } from "../hooks/useAddressSearch";

interface TripSearchProps {
  onPlanTrip: (start: string, end: string) => void;
  loading: boolean;
}

export const TripSearch: React.FC<TripSearchProps> = ({
  onPlanTrip,
  loading,
}) => {
  const {
    handleLocateMe,
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation,
  } = useLocationState();

  // Use the custom hook for both inputs
  const fromSearch = useAddressSearch();
  const toSearch = useAddressSearch();

  const handleStartPlan = () => {
    if (startLocation && endLocation) {
      onPlanTrip(
        `${startLocation.coords.lng},${startLocation.coords.lat}`,
        `${endLocation.coords.lng},${endLocation.coords.lat}`,
      );
    }
  };

  // Sync Global Context changes to the local Hook state
  useEffect(() => {
    if (startLocation && startLocation.address === "Current Location") {
      // This manually forces the input text to update when GPS is found
      fromSearch.selectAddress("Current Location");
    }
  }, [startLocation]); // Watch for when startLocation is set by handleLocateMe

  return (
    <div className="trip-search-card">
      <h3>🛡️ SafeWay Navigator</h3>

      {/* From Input */}
      <div className="input-group">
        {/* START LOCATION INPUT */}
        <div className="input-group">
          <input
            placeholder="From..."
            value={fromSearch.query}
            onChange={(e) => fromSearch.setQuery(e.target.value)}
          />
          <button onClick={handleLocateMe} className="small-locate-btn">
            🎯
          </button>
          {fromSearch.results.length > 0 && (
            <ul className="results-dropdown">
              {fromSearch.results.map((r) => (
                <li
                  key={r.place_id}
                  onClick={() => {
                    setStartLocation({
                      coords: {
                        lat: parseFloat(r.lat),
                        lng: parseFloat(r.lon),
                      },
                      address: r.display_name,
                    });
                    fromSearch.selectAddress(r.display_name);
                  }}
                >
                  {r.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* END LOCATION INPUT */}
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
                    setEndLocation({
                      coords: {
                        lat: parseFloat(r.lat),
                        lng: parseFloat(r.lon),
                      },
                      address: r.display_name,
                    });
                    toSearch.selectAddress(r.display_name);
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
    </div>
  );
};
