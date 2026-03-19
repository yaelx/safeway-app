import { Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import FlagIcon from "@mui/icons-material/FlagRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import { COLORS } from "../config/constants";

// Helper to create trip-specific MUI icons
const createTripIcon = (Component: React.ElementType, color: string) => {
  const iconHTML = renderToStaticMarkup(
    <Component style={{ fontSize: "34px" }} />,
  );

  return L.divIcon({
    html: `
      <div style="color: ${color}; display: flex; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        ${iconHTML}
      </div>`,
    className: "trip-marker-icon",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });
};

export const SafeRoute = ({
  routeData,
  path,
}: {
  routeData: any;
  path: [number, number][];
}) => {
  if (!routeData || !path.length) return null;

  const startPoint = path[0];
  const endPoint = path[path.length - 1];

  return (
    <>
      <Polyline
        positions={path}
        pathOptions={{
          color:
            routeData.summary.safetyScore > 10 ? COLORS.SAFE : COLORS.WARNING,
          weight: 5,
        }}
      />
      <Marker
        position={startPoint}
        icon={createTripIcon(MyLocationRoundedIcon, "#3b82f6")}
      >
        <Popup>
          <div className="text-right">נקודת מוצא</div>
        </Popup>
      </Marker>

      <Marker position={endPoint} icon={createTripIcon(FlagIcon, "#ef4444")}>
        <Popup>
          <div className="text-right">יעד סופי</div>
        </Popup>
      </Marker>
      {routeData.safetyReport
        .filter((p: any) => p.s)
        .map((point: any, i: number) => (
          <Marker key={`safe-${i}`} position={point.p}>
            <Popup>
              Shelter: {point.shelterName}
              <br />
              Dist: {point.d.toFixed(0)}m
            </Popup>
          </Marker>
        ))}
    </>
  );
};
