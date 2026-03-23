export interface Coords {
  lat: number;
  lng: number;
}

export interface Location {
  address: string;
  coords: Coords;
}
