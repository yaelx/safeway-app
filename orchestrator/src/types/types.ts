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
