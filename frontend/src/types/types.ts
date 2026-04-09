export interface Coords {
  lat: number;
  lng: number;
}

export interface Location {
  address: string;
  coords: Coords;
}

export interface RouteShelter {
  id: number;
  name: string;
  lng: number;
  lat: number;
  address: string;
  isOfficial: boolean;
  type: string;
}

export interface RoutePoint {
  coords: number[]; // [lat, lng]
  distance: number; // distance from previous point
  isSafe: boolean; // is safe
  shelter: RouteShelter;
}

export interface SegmentAnalysis {
  type: "residential" | "highway";
  status: "safe" | "exposed" | "caution";
  text: string;
  segmentScore: number;
  duration: number;
  geometry: string; // The polyline string for JUST this segment
  shelters: RouteShelter[];
  escapePoint?: {
    lat: number;
    lng: number;
    name: string;
  };
}

export interface DecodedSegment {
  coords: [number, number][];
  status: "safe" | "exposed" | "caution";
  type: string;
}

export interface RouteData {
  index: number;
  geometry: string; // Full route polyline
  distance: number;
  duration: number;
  safetyScore: number;
  segments: SegmentAnalysis[];
  decodedSegments?: DecodedSegment[];
  safetyReport: RoutePoint[];
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

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
}
