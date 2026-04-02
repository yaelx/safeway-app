import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationState } from "../context/LocationContext";
import { useAddressSearch } from "../hooks/useAddressSearch";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { BUTTON_TEXT } from "../config/constants";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import { Search, Close, Navigation } from "@mui/icons-material";
import { Button } from "@mui/material";
import { SearchInputWrapper } from "./SearchInputWrapper";
import { Location } from "../types/types";
import { useRoutingContext } from "../context/RoutingContext";

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
  const [activeField, setActiveField] = useState<"start" | "end" | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing route...");
  const { routeData } = useRoutingContext();

  const handleSharedLocate = () => {
    if (activeField) {
      handleLocateMe(activeField);
    }
  };

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

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (loading) {
      // Reset to initial message when loading starts
      setLoadingMessage("Analyzing route...");

      // Change message after 8 seconds (typical for cold starts or complex OSRM)
      timer = setTimeout(() => {
        setLoadingMessage("Still working... Calculating the safest path.");
      }, 8000);
    }

    return () => clearTimeout(timer);
  }, [loading]);

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
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-center gap-3 py-2 text-blue-600 bg-blue-50 rounded-xl mb-4"
          >
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </div>
            <span className="text-xs font-bold tracking-wide uppercase">
              {loadingMessage}
            </span>
          </motion.div>
        )}

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
              {/* Dynamic Icon based on results */}
              {routeData ? (
                <AltRouteIcon sx={{ color: "#2563eb", fontSize: 24 }} />
              ) : (
                <Search sx={{ color: "#94a3b8", fontSize: 20 }} />
              )}

              <div className="flex flex-col">
                <span className="text-slate-900 text-sm font-bold leading-none">
                  {routeData
                    ? `${routeData.length} Routes Found`
                    : "Plan safe route..."}
                </span>
                {routeData && (
                  <span className="text-slate-500 text-[10px] font-medium mt-1">
                    Tap lines on map to compare
                  </span>
                )}
              </div>
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
            animate={
              loading
                ? {
                    opacity: [0.9, 1, 0.9],
                    transition: { repeat: Infinity, duration: 2 },
                  }
                : { opacity: 1 }
            }
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white shadow-2xl rounded-[28px] p-5 border border-slate-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              {" "}
              {/* Changed mb-6 to mb-4 */}
              <div className="flex items-center gap-2.5">
                <Navigation
                  sx={{
                    color: "#2563eb",
                    fontSize: 20,
                    transform: "rotate(45deg)",
                  }}
                />
                <span className="font-bold text-[#1e293b] text-lg tracking-tight">
                  {" "}
                  {/* text-xl to text-lg */}
                  Route Planner
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400"
              >
                <Close sx={{ fontSize: 22 }} />
              </button>
            </div>

            {/* Inputs & Connector Logic */}
            <div className="flex gap-4 relative">
              {/* Left Column: Icons and Connector Line */}
              <div className="flex flex-col items-center pt-3 pb-3 relative">
                <MyLocationRoundedIcon
                  sx={{
                    color: "#1e293b",
                    fontSize: 16,
                    zIndex: 10,
                    bgcolor: "white",
                  }}
                />
                <div className="w-[1px] flex-grow bg-slate-200 my-1" />
                <PlaceRoundedIcon
                  sx={{
                    color: "#2563eb",
                    fontSize: 18,
                    zIndex: 10,
                    bgcolor: "white",
                  }}
                />
              </div>

              {/* Right Column: The Input Fields */}
              <div className="flex-1 space-y-2">
                <SearchInputWrapper
                  placeholder="From..."
                  query={fromSearch.query}
                  setQuery={fromSearch.setQuery}
                  recentResults={recentSearches}
                  results={fromSearch.results}
                  onSelect={selectstart}
                  onClear={clearFrom}
                  onFocus={() => setActiveField("start")}
                  handleLocate={handleSharedLocate}
                />

                <SearchInputWrapper
                  placeholder="Where to?"
                  query={toSearch.query}
                  setQuery={toSearch.setQuery}
                  recentResults={recentSearches}
                  results={toSearch.results}
                  onSelect={selectDestination}
                  onClear={clearTo}
                  onFocus={() => setActiveField("end")}
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
                //setIsExpanded(false);
                handleStartPlan();
              }}
              startIcon={<Navigation className="rotate-45" />}
              sx={{
                mt: 2,
                py: 1,
                borderRadius: "16px",
                backgroundColor: "#0f172a",
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1rem",
                boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.2)",
                transition: "all 0.2s ease",
                "&.Mui-disabled": {
                  backgroundColor: "#1e293b",
                  opacity: 0.7,
                  color: "white",
                },
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
