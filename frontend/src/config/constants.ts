export const API_ENDPOINTS = {
  SHELTERS_IN_BOUNDS: "/api/shelters/in-bounds",
  SAFE_ROUTE: "/api/get-safe-route",
};

export const MAP_CONFIG = {
  DEFAULT_CENTER: [32.0853, 34.7818] as [number, number],
  DEFAULT_ZOOM: 14,
  MIN_DISCOVERY_ZOOM: 12,
  DISCOVERY_DELAY: 800,
};

export const BUTTON_TEXT = {
  FIND_SAFE_ROUTE: "Find Safest Route",
  CALCULATING_SAFETY: "Calculating Safety...",
};

export const COLORS = {
  SAFE: "#2ecc71",
  WARNING: "#f39c12",
  USER_BLUE: "#4285F4",
  SHELTER_BLUE: "#0288d1",
};

export const SHELTER_COLORS = {
  OFFICIAL: "#1976d2", // Deep Blue for Prisma DB
  COMMUNITY: "#7b1fa2", // Purple for OSM/Community
  ROUTE_SAFE: "#2e7d32", // Green for Python-verified points
  PUBLIC_SHELTER: "#1976d2",
  SCHOOL: "#e06819ff",
  PARKING: "#83da1f85",
  PROTECTED_SPACE: "#f54de1ff",
  CARMELIT: "#120fdeff",
  default: "#757575", // Grey for unknown types
};

export const TileLayerUrl =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
