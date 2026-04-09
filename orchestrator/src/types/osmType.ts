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

export type OSMRoute = {
  geometry: string;
  distance: number;
  duration: number;
  legs: OSMLeg[]; // Updated from any
};

export interface OSMLeg {
  steps: OSMStep[];
  distance: number;
  duration: number;
}

export interface OSMStep {
  name: string;
  ref?: string;
  distance: number;
  duration: number;
  geometry: string;
  intersections: {
    location: [number, number]; // [lng, lat]
    entry: boolean[];
    bearings: number[];
  }[];
}
