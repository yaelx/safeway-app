import React, { useMemo } from "react";
import { openInGoogleMaps, openInWaze } from "../utils/navigation";
import { RoutePoint } from "../types/types";
import { useRoutingContext } from "../context/RoutingContext";
import { NavigationPanelStrings } from "../config/constants";
import { Paper } from "@mui/material";

export const NavigationPanel: React.FC = () => {
  const { routeData, selectedRoute } = useRoutingContext();
  const [isExpanded, setIsExpanded] = React.useState(true);

  // 1. Memoize the calculation based on the selectedRoute
  const uniqueShelters = useMemo(() => {
    if (!selectedRoute?.safetyReport) return 0;

    return new Set(
      selectedRoute.safetyReport.map((report: RoutePoint) => report.shelter.id),
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
    <div className="fixed bottom-[130px] left-0 right-0 z-[1002] p-3 animate-in slide-in-from-bottom duration-300 pointer-events-none">
      <div className="bg-brand-slate rounded-[24px] shadow-2xl border border-brand-border p-4 max-w-md mx-auto pointer-events-auto transition-all duration-300">
        <div
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-main leading-tight">
              {routeMode} {NavigationPanelStrings.RouteLabel}
            </h3>
            {/* Improved Visibility for Duration & Distance */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-brand-border text-text-main text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                {Math.round(selectedRoute.duration / 60)}{" "}
                {NavigationPanelStrings.MinsUnit}
              </span>
              <span className="text-text-muted text-[10px] font-medium">
                • {(selectedRoute.distance / 1000).toFixed(1)} km
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Safety Score Badge - Kept as the primary visual hook */}
            <div className="bg-route-safest/30 px-2.5 py-1.5 rounded-xl border border-route-safest/50 flex-shrink-0">
              <span className="text-route-safest text-[12px] font-black flex items-center gap-1">
                🛡️ {selectedRoute.safetyScore}%
              </span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-border text-slate-500">
              <span
                className={`text-[10px] transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}
              >
                ▼
              </span>
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ${isExpanded ? "max-h-[450px] opacity-100 mt-5" : "max-h-0 opacity-0"}`}
        >
          {/* Shelter Summary */}
          <div className="bg-brand-dark rounded-xl p-3 mb-4 flex items-center gap-3 border border-brand-blue/20">
            <Paper
              elevation={0}
              sx={{
                p: 0.5,
                bgcolor: "white",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src="/safeway_logo.svg"
                alt="SafeWay Israel"
                style={{ width: "60px", height: "auto" }}
              />
            </Paper>

            <div className="text-[13px] text-blue-100 leading-tight">
              <span className="font-bold">
                {uniqueShelters} {NavigationPanelStrings.ShelterSummaryLabel}
              </span>{" "}
              {NavigationPanelStrings.ShelterSummaryTrail}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => openInGoogleMaps(selectedRoute.geometry)}
              className="w-full bg-brand-hover text-white font-bold py-4 rounded-2xl shadow-md hover:opacity-90"
            >
              {NavigationPanelStrings.BtnGoogleMaps}
            </button>
            <button
              onClick={() => openInWaze(selectedRoute.geometry)}
              className="w-full bg-brand-hover text-white font-bold py-4 rounded-2xl shadow-md hover:opacity-90"
            >
              {NavigationPanelStrings.BtnWaze}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
