// src/types/govmap.d.ts

// If this file is in your project, we need to tell TS to add govmap to the global Window object.
declare global {
  namespace govmap {
    interface Point {
      lng: number;
      lat: number;
    }

    interface LatLng {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      token: string;
      layers?: string[];
      showXY?: boolean;
      identifyOnClick?: boolean;
      isEmbeddedToggle?: boolean;
      background?: number | string;
      layersMode?: number;
      zoomButtons?: boolean;
      onClick?: (e: any) => void;
      onPan?: (e: any) => void;
    }

    interface LayerDataParams {
      LayerName: string;
      Point: Point;
      Radius: number;
    }

    interface IntersectParams {
      address?: string;
      layerName: string;
      fields?: string[];
      whereClause?: string;
      geometry?: any;
    }

    interface ShelterResult {
      lng: number;
      lat: number;
      distance: number;
      attributes: Record<string, any>;
    }

    interface Response {
      status: number; // 0 for success
      data: ShelterResult[];
      message: string | null;
      errorCode: number;
    }

    // most common
    function createMap(target: string, options: MapOptions): void;
    function getLayerData(params: LayerDataParams): Promise<Response>;
    function intersectFeatures(params: IntersectParams): Promise<Response>;
    function geoToItm(coords: LatLng): Point;
    function itmToGeo(coords: Point): LatLng;
  }
  interface Window {
    govmap: typeof govmap;
  }
}

// This export is needed to make the file a module so 'declare global' works
export {};
