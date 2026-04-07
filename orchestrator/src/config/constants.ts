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

export const svgLogo = `
<svg width="400" height="210" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2b6cb0" />
      <stop offset="100%" stop-color="#1a365d" />
    </linearGradient>
  </defs>
  <path d="M140 100 V40 H160 V55 H185 V40 H215 V55 H240 V40 H260 V100 H140Z" fill="url(#blueGradient)" />
  <path d="M175 110 Q200 110 200 80 L185 85 L205 60 L225 85 L210 80 Q210 120 175 120 Z" fill="#ff8c00" />
  <text x="55" y="160" font-family="Arial, sans-serif" font-weight="900" font-size="48" fill="url(#blueGradient)">S</text>
  <path d="M112 125 L128 155 H96 Z M112 162 L96 132 H128 Z" fill="none" stroke="url(#blueGradient)" stroke-width="5" />
  <text x="138" y="160" font-family="Arial, sans-serif" font-weight="900" font-size="48" fill="url(#blueGradient)">FEWAY</text>
  <text x="150" y="195" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="url(#blueGradient)" letter-spacing="5">ISRAEL</text>
</svg>
`;
