// 1. MOCK DATA GENERATOR (Temporary)
// Add this interface so the file is typed correctly
export interface Shelter {
  x: number;
  y: number;
  attributes: {
    שם_מקלט: string;
    [key: string]: any;
  };
}

export async function getAllShelters(): Promise<Shelter[]> {
  const centers = [
    { lat: 32.08, lng: 34.78 },
    { lat: 32.1, lng: 34.8 },
    { lat: 32.05, lng: 34.75 },
    { lat: 32.9, lng: 35.0 },
  ];
  return centers.flatMap((c, i) =>
    Array.from({ length: 10 }).map((_, j) => ({
      x: c.lng + (Math.random() - 0.5) * 0.05,
      y: c.lat + (Math.random() - 0.5) * 0.05,
      attributes: { שם_מקלט: `מקלט ${i}-${j}` },
    })),
  );
}

export async function fetchSheltersNearPath(points: [number, number][]) {
  if (points.length === 0) return [];
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);

  const buffer = 0.01;
  const bounds = {
    minLat: Math.min(...lats) - buffer,
    maxLat: Math.max(...lats) + buffer,
    minLng: Math.min(...lngs) - buffer,
    maxLng: Math.max(...lngs) + buffer,
  };

  const all = await getAllShelters();
  return all.filter(
    (s) =>
      s.y >= bounds.minLat &&
      s.y <= bounds.maxLat &&
      s.x >= bounds.minLng &&
      s.x <= bounds.maxLng,
  );
}
