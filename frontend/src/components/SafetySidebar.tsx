import { ShieldCheck, Clock, MapPin, AlertTriangle } from "lucide-react";
import { RouteData } from "../types/types";
import { SafetySidebarStrings } from "../config/constants";

interface SafetySidebarProps {
  routes: RouteData[];
  selectedRouteId: number;
  onSelect: (id: number) => void;
}

export const SafetySidebar = ({
  routes,
  selectedRouteId,
  onSelect,
}: SafetySidebarProps) => {
  return (
    <div className="flex flex-col gap-3">
      {routes.map((route) => (
        <button
          key={route.index}
          onClick={() => onSelect(route.index)}
          className={`w-full text-left p-4 rounded-xl transition-all border-2 ${
            selectedRouteId === route.index
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-800 bg-slate-800/40"
          }`}
        >
          {/* Header: Type and Score */}
          <div className="flex justify-between items-start mb-2">
            <span className="bg-slate-700 text-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {selectedRouteId === route.index ? SafetySidebarStrings.LabelSafestRoute : SafetySidebarStrings.LabelAlternative}
            </span>
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="text-lg">{route.safetyScore}%</span>
              <ShieldCheck size={16} />
            </div>
          </div>

          {/* Stats: Time and Distance */}
          <div className="flex items-center gap-4 text-slate-400 mb-3">
            <div className="flex items-center gap-1 text-sm">
              <Clock size={14} />
              {Math.round(route.duration / 60)} min
            </div>
            <div className="flex items-center gap-1 text-sm">
              <MapPin size={14} />
              {(route.distance / 1000).toFixed(1)} km
            </div>
          </div>

          {/* The "Safety Segment" Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-medium uppercase">
              <span>{SafetySidebarStrings.LabelPathSafety}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden flex">
              {/* This represents the ratio of safe vs unsafe segments */}
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${route.safetyScore}%` }}
              />
              <div
                className="h-full bg-rose-500"
                style={{ width: `${100 - route.safetyScore}%` }}
              />
            </div>
          </div>

          {route.safetyScore < 80 && (
            <div className="mt-3 flex items-center gap-1.5 text-amber-500 text-[11px]">
              <AlertTriangle size={12} />
              {SafetySidebarStrings.WarningExposureGaps}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
