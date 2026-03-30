import { Coords } from "../types/types";

/**
 * Decodes an OSRM/Google Encoded Polyline string into an array of [lat, lng]
 */
export const decodePolyline = (
  str: string,
  precision: number = 5,
): Coords[] => {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [];
  let shift = 0,
    result = 0,
    byte = null;
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    byte = null;
    shift = 0;
    result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push({ lat: lat / factor, lng: lng / factor });
  }

  return coordinates;
};

/**
 * Extracts evenly spaced anchor points from a route geometry
 * to "force" Google Maps to follow our safe path.
 */

const getAnchorPoints = (coords: Coords[]): string => {
  // If the route is short, we don't need mid-points, Google will get it right.
  if (coords.length < 20) return "";

  // Strategy: Pick only 2 strategic mid-points instead of 3.
  // This gives Google more "breathing room" to calculate a smooth path
  // while still staying on our general "Safe" corridor.
  const p1 = coords[Math.floor(coords.length * 0.33)];
  const p2 = coords[Math.floor(coords.length * 0.66)];

  // We format them to 5 decimal places to avoid "micro-diversions"
  const format = (c: Coords) => `${c.lat.toFixed(5)},${c.lng.toFixed(5)}`;

  return `${format(p1)}|${format(p2)}`;
};

export const openInGoogleMaps = (geometryStr: string) => {
  const coords = decodePolyline(geometryStr);
  if (coords.length === 0) return;

  const origin = `${coords[0].lat},${coords[0].lng}`;
  const destination = `${coords[coords.length - 1].lat},${coords[coords.length - 1].lng}`;
  const waypoints = getAnchorPoints(coords);

  // New URL format: Directions Search
  // This often results in a "cleaner" path than the universal action link
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;

  window.open(url, "_blank");
};

export const openInWaze = (geometryStr: string) => {
  const coords = decodePolyline(geometryStr);
  if (coords.length === 0) return;
  const destination = coords[coords.length - 1];

  // Waze deep link - Note: Waze only reliably supports 1 destination via URL
  const wazeUrl = `waze://?ll=${destination.lat},${destination.lng}&navigate=yes`;
  const fallbackUrl = `https://www.waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes`;

  // Try to open app, fallback to browser after 500ms
  const start = Date.now();
  window.location.href = wazeUrl;

  setTimeout(() => {
    if (Date.now() - start < 1000) {
      window.open(fallbackUrl, "_blank");
    }
  }, 500);
};
