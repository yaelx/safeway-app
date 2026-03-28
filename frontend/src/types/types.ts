export interface Coords {
  lat: number;
  lng: number;
}

export interface Location {
  address: string;
  coords: Coords;
}

export interface OSMLocation {
  addresstype: string;
  boundingbox: number[];
  class: string;
  display_name: string;
  importance: number;
  lat: string;
  licence: string;
  lon: string;
  name: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  place_rank: number;
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
