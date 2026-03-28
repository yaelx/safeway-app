import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationState } from "../context/LocationContext";
import { useAddressSearch } from "../hooks/useAddressSearch";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { BUTTON_TEXT } from "../config/constants";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import { Search, Close, Navigation } from "@mui/icons-material";
import { Button } from "@mui/material";
import { SearchInputWrapper } from "./SearchInputWrapper";
import { Location } from "../types/types";

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
  const [expanded, setIsExpanded] = useState(false);

  const selectstart = (r: Location) => {
    setStartLocation(r);
    fromSearch.selectAddress(r.address);
  };

  const selectDestination = (r: Location) => {
    setEndLocation(r);
    toSearch.selectAddress(r.address);
    saveRecent(r);
  };

  const handleStartPlan = () => {
    if (startLocation && endLocation) {
      onPlanTrip(
        `${startLocation.coords.lng},${startLocation.coords.lat}`,
        `${endLocation.coords.lng},${endLocation.coords.lat}`,
      );
    }
    setIsExpanded(false);
  };

  useEffect(() => {
    if (startLocation?.address === "Current Location") {
      fromSearch.selectAddress("Current Location");
    }
  }, [startLocation]);

  useEffect(() => {
    if (endLocation?.address === "Current Location") {
      toSearch.selectAddress("Current Location");
    }
  }, [endLocation]);

  const clearFrom = () => {
    fromSearch.setQuery("");
    setStartLocation(null);
  };

  const clearTo = () => {
    toSearch.setQuery("");
    setEndLocation(null);
  };

  return (
    <div className="w-full max-w-md mx-auto pointer-events-auto">
      <AnimatePresence mode="wait">
        {!expanded ? (
          /* The Floating "Pill" */
          <motion.div
            key="pill"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-full px-5 py-3.5 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <Search sx={{ color: "#94a3b8", fontSize: 20 }} />
              <span className="text-slate-500 text-sm font-medium">
                Plan safe route...
              </span>
            </div>
            <Navigation
              sx={{
                color: "#2563eb",
                fontSize: 18,
                transform: "rotate(45deg)",
              }}
            />
          </motion.div>
        ) : (
          /* The Expanded Card - Matches your screenshot precisely */
          <motion.div
            key="card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white shadow-2xl rounded-[28px] p-6 border border-slate-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5">
                <Navigation
                  sx={{
                    color: "#2563eb",
                    fontSize: 22,
                    transform: "rotate(45deg)",
                  }}
                />
                <span className="font-bold text-[#1e293b] text-xl tracking-tight">
                  Route Planner
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Close sx={{ fontSize: 24 }} />
              </button>
            </div>

            {/* Inputs & Connector Logic */}
            <div className="flex gap-4 relative">
              {/* Left Column: Icons and Connector Line */}
              <div className="flex flex-col items-center pt-3 pb-3 relative">
                <PlaceRoundedIcon
                  sx={{
                    color: "#2563eb",
                    fontSize: 18,
                    zIndex: 10,
                    bgcolor: "white",
                  }}
                />
                <div className="w-[1px] flex-grow bg-slate-200 my-1" />
                <MyLocationRoundedIcon
                  sx={{
                    color: "#1e293b",
                    fontSize: 16,
                    zIndex: 10,
                    bgcolor: "white",
                  }}
                />
              </div>

              {/* Right Column: The Input Fields */}
              <div className="flex-1 space-y-4">
                <SearchInputWrapper
                  placeholder="From..."
                  query={fromSearch.query}
                  setQuery={fromSearch.setQuery}
                  recentResults={recentSearches}
                  results={fromSearch.results}
                  onSelect={selectstart}
                  onClear={clearFrom}
                  handleLocate={() => handleLocateMe("start")}
                />

                <SearchInputWrapper
                  placeholder="Where to?"
                  query={toSearch.query}
                  setQuery={toSearch.setQuery}
                  recentResults={recentSearches}
                  results={toSearch.results}
                  onSelect={selectDestination}
                  onClear={clearTo}
                  handleLocate={() => handleLocateMe("end")}
                />
              </div>
            </div>
            <Button
              fullWidth
              variant="contained"
              className="w-full bg-[#0f172a] text-white font-bold py-4 rounded-2xl mt-6 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 text-base"
              disabled={loading || !startLocation || !endLocation}
              loading={loading}
              loadingPosition="start"
              onClick={() => {
                setIsExpanded(false);
                handleStartPlan();
              }}
              sx={{
                mt: 4, // Increased spacing from input
                py: 2,
                borderRadius: "16px",
                backgroundColor: "#0f172a",
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1rem",
                boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.2)",
                "&:hover": { backgroundColor: "#1e293b" },
              }}
            >
              {loading
                ? BUTTON_TEXT.CALCULATING_SAFETY
                : BUTTON_TEXT.FIND_SAFE_ROUTE}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
