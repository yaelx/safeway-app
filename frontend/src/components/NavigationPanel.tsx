import React, { useMemo } from "react";
import { openInGoogleMaps, openInWaze } from "../utils/navigation";
import { Coords, RouteData, RoutePoint } from "../types/types";
import { useRoutingContext } from "../context/RoutingContext";

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
    ? "Recommended"
    : isShortestTime
      ? "Fastest"
      : "Alternative";

  return (
    <div className="fixed bottom-[130px] left-0 right-0 z-[1000] p-3 animate-in slide-in-from-bottom duration-300 pointer-events-none">
      <div className="bg-[#1a1a1a] rounded-[24px] shadow-2xl border border-[#333] p-4 max-w-md mx-auto pointer-events-auto transition-all duration-300">
        <div
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {routeMode} Route
            </h3>
            {/* Improved Visibility for Duration & Distance */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-[#334155] text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                {Math.round(selectedRoute.duration / 60)} mins
              </span>
              <span className="text-slate-500 text-[10px] font-medium">
                • {(selectedRoute.distance / 1000).toFixed(1)} km
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Safety Score Badge - Kept as the primary visual hook */}
            <div className="bg-[#064e3b]/30 px-2.5 py-1.5 rounded-xl border border-emerald-900/50 flex-shrink-0">
              <span className="text-emerald-400 text-[12px] font-black flex items-center gap-1">
                🛡️ {selectedRoute.safetyScore}%
              </span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#333] text-slate-500">
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
          {/* Shelter Summary logic remains the same */}
          <div className="bg-[#1e293b] rounded-xl p-3 mb-4 flex items-center gap-3 border border-blue-900/20">
            <span className="text-2xl leading-none">🏠</span>
            <div className="text-[13px] text-blue-100 leading-tight">
              {/* text-blue-100 */}
              <span className="font-bold">
                {uniqueShelters} Unique Shelters
              </span>{" "}
              along this trajectory.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => openInGoogleMaps(selectedRoute.geometry)}
              className="w-full bg-[#2563eb] text-white font-bold py-4 rounded-2xl shadow-md hover:bg-[#1d4ed8]"
            >
              Navigate with Google Maps
            </button>
            <button
              onClick={() => openInWaze(selectedRoute.geometry)}
              className="w-full bg-[#1a1a1a] border border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm"
            >
              Open in Waze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
