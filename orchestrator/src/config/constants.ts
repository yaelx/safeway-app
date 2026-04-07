import dotenv from "dotenv";
import path from "path";

// Load .env.local FIRST. If a variable is found here,
// it won't be overwritten by the standard .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

export const SHELTER_TYPES = {
  BOMB_SHELTER: "bomb_shelter",
  PUBLIC: "Public Shelter",
};

export const REPORT_REASONS = {
  WRONG_LOCATION: "wrong_location",
  MISSING: "missing",
  CLOSED: "closed",
};

export const API_PATHS = {
  OSM_INTERPRETER: "https://overpass-api.de/api/interpreter",
  OSRM_ROUTE: "https://router.project-osrm.org/route/v1/driving/",
};

export const INTERNAL_SERVICES = {
  PYTHON_SOLVER: {
    BASE_URL: process.env.LOGIC_SERVER_URL,
    ENDPOINTS: {
      EVALUATE: "/evaluate_alternatives",
      HEALTH: "/health",
    },
    HEADER_KEY: "X-Internal-Token",
  },
};

export const PRODUCTION_URL = "https://safeway-app.vercel.app";
export const LOCAL_URL = "http://localhost:3000";

export const API_ENDPOINTS = {
  SHELTERS: "/api/shelters",
  SHELTERS_IN_BOUNDS: "/in-bounds",
  SAFE_ROUTE: "/api/get-safe-route",
  CONTACT: "/api/contact",
};
