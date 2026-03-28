import { OSMLocation, Location } from "../types/types";

export const converOSMLocationToLocation = (
  osmLocation: OSMLocation,
): Location => {
  return {
    address: osmLocation.display_name,
    coords: {
      lat: parseFloat(osmLocation.lat),
      lng: parseFloat(osmLocation.lon),
    },
  };
};
