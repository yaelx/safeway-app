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

export type RouteData = {
  id: string;
  index: number;
  safetyScore: number;
  geometry: string;
  distance: number;
  duration: number;
  segments: SegmentAnalysis[];
};

export interface IRoutingRequest {
  start: string; // "lng,lat"
  end: string; // "lng,lat"
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

export type PythonRouteResponse = {
  id: string;
  index: number;
  safetyScore: number;
  segments: SegmentAnalysis[];
};

export type PythonSolverResponse = {
  routes: PythonRouteResponse[];
  totalFound: number;
};

export interface IRoutingResponse {
  totalFound: number;
  routes: RouteData[];
}
