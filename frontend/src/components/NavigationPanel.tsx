import React from "react";
import { openInGoogleMaps, openInWaze } from "../utils/navigation";
import { Coords, RouteData, RoutePoint } from "../types/types";

interface NavigationPanelProps {
  route: RouteData;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({ route }) => {
  const uniqueShelters = new Set(
    route.safetyReport.map((report: RoutePoint) => report.shelter.id),
  ).size;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 animate-in slide-in-from-bottom duration-300 pointer-events-none">
      <div className="bg-white rounded-[28px] shadow-2xl border border-slate-50 p-6 max-w-md mx-auto pointer-events-auto">
        {/* Dynamic Header & Safety Badge */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              Recommended Path
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              {Math.round(route.duration / 60)} mins •{" "}
              {(route.distance / 1000).toFixed(1)} km
            </p>
          </div>

          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            <span className="text-emerald-700 text-xs font-black flex items-center gap-1.5">
              🛡️ {route.safetyScore}% SAFE
            </span>
          </div>
        </div>

        {/* Shelter Utility Summary */}
        <div className="bg-[#f0f7ff] rounded-2xl p-4 mb-6 flex items-center gap-4">
          <span className="text-3xl filter drop-shadow-sm leading-none">
            🏠
          </span>
          <div className="text-[14px] text-blue-900 leading-snug">
            <span className="font-bold">{uniqueShelters} Unique Shelters</span>{" "}
            detected along this specific trajectory.
          </div>
        </div>

        {/* Primary Navigation Actions */}
        <div className="space-y-3">
          <button
            onClick={() => openInGoogleMaps(route.geometry)}
            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex flex-col items-center justify-center shadow-lg shadow-blue-200 active:scale-[0.98]"
          >
            <span className="text-[15px]">Navigate with Google Maps</span>
            <span className="text-[10px] font-medium opacity-70 uppercase tracking-wider">
              Follow Safest Path
            </span>
          </button>

          <button
            onClick={() => openInWaze(route.geometry)}
            className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span className="text-sm">Open in Waze</span>
          </button>
        </div>

        {/* System Footer */}
        <div className="flex flex-col items-center mt-5 gap-1">
          <div className="h-[1px] w-8 bg-slate-100 mb-2" />
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em]">
            SafeWay Engine • Data Updated {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
