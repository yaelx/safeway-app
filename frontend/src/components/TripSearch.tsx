import React, { useState, useEffect } from "react";
import { useLocationState } from "../context/LocationContext";
import { useAddressSearch } from "../hooks/useAddressSearch";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { BUTTON_TEXT } from "../config/constants";
import { Button } from "@mui/material";

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
  const { recentSearches, saveRecent } = useRecentSearches();
  const [showRecent, setShowRecent] = useState(false);

  const selectDestination = (r: any) => {
    const loc = {
      coords: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
      address: r.display_name,
    };
    setEndLocation(loc);
    toSearch.selectAddress(r.display_name);
    saveRecent(loc);
    setShowRecent(false);
  };

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

  // Helper to clear "From"
  const clearFrom = () => {
    fromSearch.setQuery("");
    setStartLocation(null);
  };

  // Helper to clear "To"
  const clearTo = () => {
    toSearch.setQuery("");
    setEndLocation(null);
  };

  return (
    <div
      className="trip-search-card"
      style={{ padding: "20px", borderRadius: "16px" }}
    >
      <header style={{ marginBottom: "15px" }}>
        <h3 style={{ margin: 0 }}>🛡️ SafeWay Navigator</h3>
        <small style={{ color: "#666" }}>
          Plan your route with shelter coverage
        </small>
      </header>

      <div
        className="search-container"
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {/* FROM ROW: Input (with X) + Locate Button (Outside) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              placeholder="From..."
              value={fromSearch.query}
              onChange={(e) => fromSearch.setQuery(e.target.value)}
              style={{
                width: "100%",
                paddingRight: "30px",
                boxSizing: "border-box",
              }}
            />
            {fromSearch.query && (
              <button
                onClick={clearFrom}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleLocateMe}
            title="Locate Me"
            style={{
              padding: "5px",
              fontSize: "18px",
              background: "none",
              border: "0px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🎯
          </button>
        </div>

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

      {/* TO INPUT */}
      <div style={{ position: "relative", width: "calc(100% - 38px)" }}>
        <input
          placeholder="Destination..."
          value={toSearch.query}
          onChange={(e) => toSearch.setQuery(e.target.value)}
          onFocus={() => setShowRecent(true)}
          onBlur={() => setTimeout(() => setShowRecent(false), 200)}
          style={{
            width: "100%",
            paddingRight: "30px",
            boxSizing: "border-box",
          }}
        />
        {toSearch.query && (
          <button
            onClick={clearTo}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#999",
            }}
          >
            ✕
          </button>
        )}
        {/* Show recents if query is empty and we have saved data */}
        {!toSearch.query && showRecent && recentSearches.length > 0 && (
          <ul className="results-dropdown recent-list">
            <li className="dropdown-header">RECENT DESTINATIONS</li>
            {recentSearches.map((res, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setEndLocation(res);
                  toSearch.selectAddress(res.address);
                  setShowRecent(false);
                }}
              >
                🕒 {res.address}
              </li>
            ))}
          </ul>
        )}

        {toSearch.results.length > 0 && (
          <ul className="results-dropdown">
            {toSearch.results.map((r) => (
              <li
                key={r.place_id}
                onClick={() => {
                  selectDestination(r);
                }}
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        loading={loading}
        loadingPosition="start"
        onClick={handleStartPlan}
        disabled={loading || !startLocation || !endLocation}
        style={{
          marginTop: "10px",
          backgroundColor:
            loading || !startLocation || !endLocation ? "#ccc" : "#000",
          color: "#fff",
          padding: "12px 8px",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
      >
        {loading ? BUTTON_TEXT.CALCULATING_SAFETY : BUTTON_TEXT.FIND_SAFE_ROUTE}
      </Button>
    </div>
  );
};
