import axios from "axios";
import { RouteShelter } from "../types/types";
import { logger } from "../middleware/logger";

export async function fetchSheltersNearPath(points: [number, number][]) {
  if (points.length === 0) return [];

  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  const padding = 0.05;
  const minLat = Math.min(...lats) - padding;
  const maxLat = Math.max(...lats) + padding;
  const minLng = Math.min(...lngs) - padding;
  const maxLng = Math.max(...lngs) + padding;

  const query = `
  [out:json][timeout:25];
  (
    node["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng});
    way["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng});
    node["defensive_facility"="shelter"](${minLat},${minLng},${maxLat},${maxLng});
    node["shelter_type"="bomb_shelter"](${minLat},${minLng},${maxLat},${maxLng});
    way["shelter_type"="bomb_shelter"](${minLat},${minLng},${maxLat},${maxLng});
  );
  out center;`;

  try {
    logger.info({ event: 'OSM_QUERY_START' }, 'Fetching near-path shelters from Overpass API');
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await axios.get(url);

    const shelters: RouteShelter[] = response.data.elements.map((el: any) => ({
      lng: el.lon || el.center.lon,
      lat: el.lat || el.center.lat,
      name: el.tags.name || "Public Shelter",
      isOfficial: false,
      address: el.tags.address || "",
      id: el.id,
      type: el.tags.type || "",
    }));

    logger.info({ event: 'OSM_QUERY_DONE', shelterCount: shelters.length }, 'OSM shelter query complete');
    return shelters;
  } catch (err) {
    logger.error({ event: 'OSM_QUERY_ERROR', err }, 'OSM Overpass query failed, returning empty shelter list');
    return [];
  }
}
