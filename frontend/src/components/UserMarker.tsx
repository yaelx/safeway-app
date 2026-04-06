import { Marker, Circle, Popup } from "react-leaflet";
import { COLORS, UserMarkerStrings } from "../config/constants";

export const UserMarker = ({
  coords,
  icon,
}: {
  coords: L.LatLng;
  icon: L.DivIcon;
}) => (
  <>
    <Circle
      center={coords}
      radius={500}
      pathOptions={{ color: COLORS.USER_BLUE, fillOpacity: 0.2 }}
    />
    <Marker position={coords} icon={icon}>
      <Popup>{UserMarkerStrings.PopupYouAreHere}</Popup>
    </Marker>
  </>
);
