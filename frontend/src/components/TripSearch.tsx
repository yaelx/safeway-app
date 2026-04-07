import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationState } from "../context/LocationContext";
import { useAddressSearch } from "../hooks/useAddressSearch";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { BUTTON_TEXT, TripSearchStrings } from "../config/constants";
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
  const [loadingMessage, setLoadingMessage] = useState(
    TripSearchStrings.LoadingAnalyzing,
  );
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
    if (startLocation?.address === TripSearchStrings.CurrentLocation) {
      fromSearch.selectAddress(TripSearchStrings.CurrentLocation);
    }
  }, [startLocation]);

  useEffect(() => {
    if (endLocation?.address === TripSearchStrings.CurrentLocation) {
      toSearch.selectAddress(TripSearchStrings.CurrentLocation);
    }
  }, [endLocation]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (loading) {
      // Reset to initial message when loading starts
      setLoadingMessage(TripSearchStrings.LoadingAnalyzing);

      // Change message after 8 seconds (typical for cold starts or complex OSRM)
      timer = setTimeout(() => {
        setLoadingMessage(TripSearchStrings.LoadingStillWorking);
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
              {loadingMessage}x
            </span>
          </motion.div>
        )}

        {!expanded ? (
          /* The Floating "Pill" */
          <motion.div
            key="collapsed"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="bg-brand-slate backdrop-blur-sm border shadow-2xl rounded-full p-4 flex items-center justify-between cursor-pointer border-brand-border hover:border-brand-border transition-colors pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              {/* Dynamic Icon based on results */}
              {routeData ? (
                <AltRouteIcon sx={{ color: "brand.text.muted", fontSize: 24 }} />
              ) : (
                <Search sx={{ color: "brand.text.muted", fontSize: 20 }} />
              )}

              <div className="flex flex-col">
                <span className="text-slate-400 text-sm font-medium text-[15px]">
                  {routeData
                    ? `${routeData.length} ${TripSearchStrings.PillRoutesFound}`
                    : TripSearchStrings.PillPlanRoute}
                </span>
                {routeData && (
                  <span className="text-slate-400 text-[15px] font-medium mt-1">
                    {TripSearchStrings.PillTapToCompare}
                  </span>
                )}
              </div>
            </div>
            <Navigation
              sx={{
                color: "brand.hover",
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
            className="bg-brand-slate shadow-2xl rounded-[28px] p-5 border border-brand-border"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              {" "}
              {/* Changed mb-6 to mb-4 */}
              <div className="flex items-center gap-2.5">
                <Navigation
                  sx={{
                    color: "brand.blue",
                    fontSize: 20,
                    transform: "rotate(45deg)",
                  }}
                />
                <span className="font-bold text-white text-lg tracking-tight">
                  {" "}
                  {/* text-xl to text-lg */}
                  {TripSearchStrings.HeaderRoutePlanner}
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
                    color: "brand.text.muted",
                    fontSize: 16,
                    zIndex: 10,
                    bgcolor: "brand.slate",
                  }}
                />
                <div className="w-[1px] flex-grow bg-slate-200 my-1" />
                <PlaceRoundedIcon
                  sx={{
                    color: "brand.blue",
                    fontSize: 18,
                    zIndex: 10,
                    bgcolor: "brand.slate",
                  }}
                />
              </div>

              {/* Right Column: The Input Fields */}
              <div className="flex-1 space-y-2">
                <SearchInputWrapper
                  placeholder={TripSearchStrings.PlaceholderFrom}
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
                  placeholder={TripSearchStrings.PlaceholderWhereTo}
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
              // className="w-full bg-[#0f172a] text-white font-bold py-4 rounded-2xl mt-6 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 text-base"
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
                backgroundColor: "brand.hover", // Primary action color
                color: "brand.text.main",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "brand.blue" },
                "&.Mui-disabled": {
                  backgroundColor: "brand.border",
                  color: "rgba(255,255,255,0.3)",
                },
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
