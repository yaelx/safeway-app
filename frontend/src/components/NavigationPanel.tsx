import React, { useMemo } from "react";
import { openInGoogleMaps, openInWaze } from "../utils/navigation";
import { RouteShelter, SegmentAnalysis } from "../types/types";
import { useRoutingContext } from "../context/RoutingContext";
import { NavigationPanelStrings } from "../config/constants";
import { Paper } from "@mui/material";

export const NavigationPanel: React.FC = () => {
  const { routeData, selectedRoute, onSelectRoute } = useRoutingContext();
  const [isExpanded, setIsExpanded] = React.useState(true);

  // 1. Memoize the calculation based on the selectedRoute
  const uniqueShelters = useMemo(() => {
    if (!selectedRoute?.segments) return 0;

    return new Set(
      selectedRoute.segments.map((segment: SegmentAnalysis) =>
        segment.shelters.map((shelter: RouteShelter) => shelter.id),
      ),
    ).size;
  }, [selectedRoute]);

  if (!selectedRoute || !routeData) return null;

  // COMPARISON LOGIC: Determine the dynamic title
  const isHighestSafety = routeData.every(
    (r) => selectedRoute.safetyScore >= r.safetyScore,
  );
  const isShortestTime = routeData.every(
    (r) => selectedRoute.duration <= r.duration,
  );

  const routeMode = isHighestSafety
    ? NavigationPanelStrings.RouteModeRecommended
    : isShortestTime
      ? NavigationPanelStrings.RouteModeFastest
      : NavigationPanelStrings.RouteModeAlternative;

  return (
    // Container docked strictly to the bottom-left with increased width
    <div className="fixed bottom-6 left-6 z-[2000] w-[400px] animate-in slide-in-from-bottom-5 duration-300">
      {/* Route Tabs Selector */}
      <div className="flex gap-1.5 mb-[-1px] ml-2 relative z-10">
        {routeData.map((route, index) => {
          const isActive = selectedRoute.id === route.id;
          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`px-4 py-2 rounded-t-xl text-[11px] font-bold transition-all ${
                isActive
                  ? "bg-brand-slate text-white border-t border-x border-brand-border"
                  : "bg-brand-dark/80 text-text-muted hover:bg-brand-dark"
              }`}
            >
              Route {index + 1} ({Math.round(route.duration / 60)}m)
            </button>
          );
        })}
      </div>

      {/* Main Content Panel */}
      <div className="bg-brand-slate rounded-2xl rounded-tl-none border border-brand-border shadow-2xl p-4 transition-all duration-300">
        {/* Header / Click to Collapse */}
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Text Container with margin-right to prevent overlap */}
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-main leading-tight">
                {routeMode} Route
              </h3>
              <span className="text-text-muted text-[10px] font-medium whitespace-nowrap">
                • {(selectedRoute.distance / 1000).toFixed(1)} km
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="bg-brand-border text-text-main text-[10px] font-bold px-2 py-0.5 rounded-md">
                {Math.round(selectedRoute.duration / 60)}{" "}
                {NavigationPanelStrings.MinsUnit}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-route-safest/10 px-2 py-1 rounded-xl border border-route-safest/30 flex-shrink-0">
              <span className="text-route-safest text-[12px] font-black">
                🛡️ {selectedRoute.safetyScore}%
              </span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-border text-slate-500 flex-shrink-0">
              <span
                className={`transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}
              >
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-brand-dark rounded-xl p-3 mb-4 flex items-center gap-3 border border-brand-blue/10">
            <Paper
              elevation={0}
              sx={{ p: 0.5, bgcolor: "white", borderRadius: "8px" }}
            >
              <img src="/safeway_logo.svg" alt="logo" className="w-[50px]" />
            </Paper>
            <div className="text-[11px] text-blue-100/80 leading-snug">
              <span className="font-bold">{uniqueShelters} Shelters</span> found
              along this path.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => openInGoogleMaps(selectedRoute.geometry)}
              className="bg-brand-hover text-white font-bold py-3 rounded-xl text-sm transition-transform active:scale-95"
            >
              {NavigationPanelStrings.BtnGoogleMaps}
            </button>
            <button
              onClick={() => openInWaze(selectedRoute.geometry)}
              className="bg-brand-hover text-white font-bold py-3 rounded-xl text-sm transition-transform active:scale-95"
            >
              {NavigationPanelStrings.BtnWaze}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
