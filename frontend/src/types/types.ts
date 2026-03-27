export interface Coords {
  lat: number;
  lng: number;
}

export interface Location {
  address: string;
  coords: Coords;
}

export interface RoutePoint {
  p: number[]; // [lat, lng]
  d: number; // distance from previous point
  s: boolean; // is safe
  shelter: any;
}

export interface RouteData {
  index: number;
  geometry: string;
  distance: number;
  duration: number;
  safetyScore: number;
  safetyReport: RoutePoint[];
}
