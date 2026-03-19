import { Marker, Circle, Popup } from "react-leaflet";
import { COLORS } from "../config/constants";

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
      <Popup>You are here</Popup>
    </Marker>
  </>
);
