export type RawShelter = {
  name?: string;
  address?: string;
  lat?: number | string;
  lng?: number | string;
  type?: string;
};

export type NormalizedShelter = {
  name: string;
  address?: string | null;
  lat: number;
  lng: number;
  type: string | null;
  city: string | null;
};

export interface RoutePoint {
  p: number[]; // [lat, lng]
  d: number; // distance from previous point
  s: boolean; // is safe
  shelter: any;
}

export type ScoredRoute = {
  routeIndex: number;
  safetyScore: number;
  safetyReport: RoutePoint[];
  fullGeometry: number[][];
};
