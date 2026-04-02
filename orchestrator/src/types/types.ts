export interface Coords {
  lat: number;
  lng: number;
}

export type RawShelter = {
  name?: string;
  address?: string;
  lat?: number | string;
  lng?: number | string;
  type?: string;
};

// for prisma db insertion
export type NormalizedShelter = Omit<
  DBShelter,
  "id" | "createdAt" | "updatedAt"
>;

export type DBShelter = {
  name: string;
  id: number;
  lat: number;
  lng: number;
  address: string;
  type: string;
  isOfficial: boolean;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
};

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

// format of response from python server
export type ScoredRoute<TGeometry = number[][]> = {
  index: number;
  safetyScore: number;
  safetyReport: RoutePoint[];
  geometry: TGeometry;
};

export type RouteData = ScoredRoute<string> & {
  distance: number;
  duration: number;
};

export interface IRoutingRequest {
  start: string; // "lng,lat"
  end: string; // "lng,lat"
}

export interface IRoutingResponse {
  totalFound: number;
  routes: RouteData[];
}
