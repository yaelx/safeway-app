import { Marker, Circle, Popup } from "react-leaflet";
import { UserMarkerStrings } from "../config/constants";
import { BRAND_COLORS } from "../theme/theme";

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
      pathOptions={{ color: BRAND_COLORS.blue, fillOpacity: 0.2 }}
    />
    <Marker position={coords} icon={icon}>
      <Popup>{UserMarkerStrings.PopupYouAreHere}</Popup>
    </Marker>
  </>
);
