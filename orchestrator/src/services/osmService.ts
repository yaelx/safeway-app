import axios from "axios";

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
    console.log("Fetching near path shelters from OSM...");
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await axios.get(url);

    const shelters = response.data.elements.map((el: any) => ({
      x: el.lon || el.center.lon,
      y: el.lat || el.center.lat,
      name: el.tags.name || "Public Shelter",
      isOfficial: false,
      address: el.tags.address || "",
      id: el.id,
    }));

    console.log(`Found ${shelters.length} shelters via OSM.`);
    return shelters;
  } catch (err) {
    console.error("OSM Fetch failed, using empty list.");
    return [];
  }
}
