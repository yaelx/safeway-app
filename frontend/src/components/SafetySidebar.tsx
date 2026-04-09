import { ShieldCheck, Clock, MapPin, AlertTriangle } from "lucide-react";
import { RouteData } from "../types/types";
import { SafetySidebarStrings } from "../config/constants";

interface SafetySidebarProps {
  routes: RouteData[];
  selectedRouteId: string;
  onSelect: (id: string) => void;
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
          key={route.id}
          onClick={() => onSelect(route.id)}
          className={`w-full text-left p-4 rounded-xl transition-all border-2 ${
            selectedRouteId === route.id
              ? "border-route-safest bg-route-safest/10"
              : "border-brand-border bg-brand-border/40"
          }`}
        >
          {/* Header: Type and Score */}
          <div className="flex justify-between items-start mb-2">
            <span className="bg-brand-border text-text-main px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {selectedRouteId === route.id
                ? SafetySidebarStrings.LabelSafestRoute
                : SafetySidebarStrings.LabelAlternative}
            </span>
            <div className="flex items-center gap-1 text-route-safest font-bold">
              <span className="text-lg">{route.safetyScore}%</span>
              <ShieldCheck size={16} />
            </div>
          </div>

          {/* Stats: Time and Distance */}
          <div className="flex items-center gap-4 text-text-muted mb-3">
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
            <div className="flex justify-between text-[10px] text-text-muted font-medium uppercase">
              <span>{SafetySidebarStrings.LabelPathSafety}</span>
            </div>
            <div className="h-1.5 w-full bg-brand-border rounded-full overflow-hidden flex">
              {/* This represents the ratio of safe vs unsafe segments */}
              <div
                className="h-full bg-route-safest"
                style={{ width: `${route.safetyScore}%` }}
              />
              <div
                className="h-full bg-error"
                style={{ width: `${100 - route.safetyScore}%` }}
              />
            </div>
          </div>

          {route.safetyScore < 80 && (
            <div className="mt-3 flex items-center gap-1.5 text-route-alt text-[11px]">
              <AlertTriangle size={12} />
              {SafetySidebarStrings.WarningExposureGaps}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
