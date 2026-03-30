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
    <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 max-w-md mx-auto">
        {/* Route Info Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Recommended Path
            </h3>
            <p className="text-sm text-gray-500">
              {Math.round(route.duration / 60)} mins •{" "}
              {(route.distance / 1000).toFixed(1)} km
            </p>
          </div>
          <div className="bg-green-100 px-3 py-1 rounded-full">
            <span className="text-green-700 text-sm font-bold">
              🛡️ {route.safetyScore}% Safe
            </span>
          </div>
        </div>

        {/* Shelter Quick Stats */}
        <div className="bg-blue-50 rounded-lg p-3 mb-5 flex items-center gap-3">
          <div className="text-2xl">🏠</div>
          <div className="text-sm text-blue-800">
            <strong>{uniqueShelters} Unique Shelters</strong> detected along
            this specific trajectory.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => openInGoogleMaps(route.geometry)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
          >
            <span>Navigate with Google Maps</span>
            <span className="text-xs font-normal opacity-80">
              (Safest Path)
            </span>
          </button>

          <button
            onClick={() =>
              openInWaze(route.geometry[route.geometry.length - 1])
            }
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Open in Waze</span>
          </button>
        </div>

        {/* SafeWay Branding / Footer */}
        <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest">
          SafeWay Engine • Data updated for {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
