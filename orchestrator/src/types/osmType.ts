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
  weight: number;
  weight_name: string;
  legs: {
    steps: any[];
    weight: number;
    summary: string;
    duration: number;
    distance: number;
  }[];
};
