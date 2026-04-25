import { Marker, Circle, Popup } from "react-leaflet";
import { UserMarkerStrings } from "../config/constants";
import { BRAND_COLORS } from "../theme/theme";
import { Coords } from "../types/types";
import { useMemo } from "react";
import L from "leaflet";

export const UserMarker = ({
  coords,
  icon,
}: {
  coords: Coords;
  icon: L.DivIcon;
}) => {
  const latLng = useMemo(
    () => new L.LatLng(coords.lat, coords.lng),
    [coords.lat, coords.lng],
  );

  return (
    <>
      <Circle
        center={latLng}
        radius={500}
        pathOptions={{ color: BRAND_COLORS.blue, fillOpacity: 0.2 }}
      />
      <Marker position={latLng} icon={icon}>
        <Popup>{UserMarkerStrings.PopupYouAreHere}</Popup>
      </Marker>
    </>
  );
};
