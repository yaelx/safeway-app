import express, { Request, Response } from "express";
import cors from "cors";
import * as polyline from "@mapbox/polyline";
import axios from "axios";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

async function fetchSheltersNearPath(points: [number, number][]) {
  if (points.length === 0) return [];

  // 1. Calculate Bounding Box
  const lats = points.map((p) => p[0]);

  const lngs = points.map((p) => p[1]);

  const padding = 0.05;
  const minLat = Math.min(...lats) - padding;
  const maxLat = Math.max(...lats) + padding;
  const minLng = Math.min(...lngs) - padding;
  const maxLng = Math.max(...lngs) + padding;

  // 2. Overpass Query (Looking for bomb shelters)
  const query = `
  [out:json][timeout:25];
  (
    node["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng});
    way["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng});
    node["defensive_facility"="shelter"](${minLat},${minLng},${maxLat},${maxLng});
  );
  out center;`;

  try {
    console.log("Fetching real shelters from OSM...");
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await axios.get(url);

    // 3. Map to Python-friendly format {x: lng, y: lat}
    const shelters = response.data.elements.map((el: any) => ({
      x: el.lon || el.center.lon,
      y: el.lat || el.center.lat,
      attributes: { שם_מקלט: el.tags.name || "Public Shelter" },
    }));

    console.log(`Found ${shelters.length} shelters via OSM.`);
    return shelters;
  } catch (err) {
    console.error("OSM Fetch failed, using empty list.");
    return [];
  }
}

const shelterCache = new Map<string, any[]>();

app.post("/api/shelters-in-bounds", async (req, res) => {
  const { minLat, maxLat, minLng, maxLng } = req.body;

  // Create a unique key based on the bounding box
  // We round to 3 decimal places (~100m precision) to increase cache hits
  const cacheKey = `${Math.round(minLat * 1000)},${Math.round(maxLat * 1000)},${Math.round(minLng * 1000)},${Math.round(maxLng * 1000)}`;

  const dbShelters = await prisma.shelter.findMany({
    where: {
      lat: { gte: minLat, lte: maxLat },
      lng: { gte: minLng, lte: maxLng },
    },
  });

  // 2. Map back to the { x, y } format your Python solver/frontend expects
  const matchedLocal = dbShelters.map((s: any) => ({
    x: s.lng,
    y: s.lat,
    name: s.name,
    id: s.id,
    address: s.address,
    isOfficial: true,
  }));

  // 2. Check Cache for OSM data
  let osmShelters: never[] = [];

  // 3. Check if we have this area in the cache
  if (shelterCache.has(cacheKey)) {
    console.log("Serving shelters from Cache 🚀");
    return res.json({ shelters: shelterCache.get(cacheKey) });
  }

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng});
      way["amenity"="shelter"](${minLat},${minLng},${maxLat},${maxLng});
    );
    out center;`;

  try {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const osmShelters = response.data.elements.map((el: any) => ({
      x: el.lon || el.center.lon,
      y: el.lat || el.center.lat,
      name: el.tags.name || "Public Shelter",
      isOfficial: false,
    }));
    console.log(
      `Fetched ${osmShelters.length} shelters from OSM and cached them.`,
    );
    //res.json({ shelters });

    // 4. Add to cache
    shelterCache.set(cacheKey, osmShelters);
    console.log(
      `Added ${osmShelters.length} shelters to cache for key: ${cacheKey}`,
    );
  } catch (error: any) {
    // Check if the error came from the OSM API specifically
    if (error.response) {
      console.error("OSM API Refused Request:", error.response.status);
      // If 429, you're moving the map too fast!
    } else {
      console.error("Node Server Error:", error.message);
    }
    res
      .status(500)
      .json({ error: "OSM server is busy, try again in a moment" });
  }

  // 3. Combine both lists
  const allShelters = [...matchedLocal, ...osmShelters];

  res.json({ shelters: allShelters });
});

// MAIN PROXY ROUTE
app.get("/api/get-safe-route", async (req: Request, res: Response) => {
  const { start, end } = req.query;
  if (!start || !end) {
    res.status(400).json({ error: "Missing coords" });
    return;
  }

  console.log("Calling Python Solver at:", process.env.LOGIC_SERVER_URL);
  console.log("Calling OSRM with points:", start, end);

  try {
    // A. Fetch Route from OSRM
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=polyline`;
    console.log("Calling OSRM with URL:", routeUrl);
    const routeRes = await axios.get(routeUrl);
    const routeData = routeRes.data;

    if (!routeData.routes?.length) throw new Error("No route found");
    const points = polyline.decode(routeData.routes[0].geometry);

    // B. CALCULATE BOUNDS FOR THE CURRENT ROUTE
    // We add a small padding (e.g., 0.01 degrees ~1km) so we don't miss nearby shelters
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    const padding = 0.01;

    const bounds = {
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLng: Math.min(...lngs) - padding,
      maxLng: Math.max(...lngs) + padding,
    };

    // C. FETCH SHELTERS (OSM + PRISMA)
    const [osmShelters, dbShelters] = await Promise.all([
      fetchSheltersNearPath(points),
      prisma.shelter.findMany({
        where: {
          lat: { gte: bounds.minLat, lte: bounds.maxLat },
          lng: { gte: bounds.minLng, lte: bounds.maxLng },
        },
      }),
    ]);

    // D. FORMAT PRISMA SHELTERS
    const officialShelters = dbShelters.map((s: any) => ({
      x: s.lng,
      y: s.lat,
      name: s.name,
      address: s.address,
      isOfficial: true,
    }));

    // E. MERGE
    const allShelters = [...osmShelters, ...officialShelters];

    // C. Delegate math to Python solver
    const pythonRes = await axios.post(
      `${process.env.LOGIC_SERVER_URL}/evaluate_route`,
      {
        routePoints: points,
        shelterData: allShelters,
      },
      {
        headers: { "X-Internal-Token": process.env.INTERNAL_SECRET_TOKEN },
      },
    );

    const safetyData = pythonRes.data;

    // Calculate unique safe shelters for the summary
    // (Assuming safetyReport entries contain a shelterId or name when 's' is true)
    const safeSheltersCount = new Set(
      safetyData.safetyReport
        .filter((p: any) => p.s === true)
        .map((p: any) => p.shelterName), // Ensure Python returns the name/ID of the snapped shelter
    ).size;

    // D. Response
    res.status(200).json({
      summary: {
        distance: routeData.routes[0].distance,
        unit: "km",
        safetyScore: safetyData.safetyScore,
        safeSheltersCount: safeSheltersCount,
      },
      routeGeometry: routeData.routes[0].geometry,
      safetyReport: safetyData.safetyReport, // Using the new solver property name
    });
  } catch (error: any) {
    console.error("Error evaluating route:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT: number = parseInt(process.env.PORT || "4000", 10);
const HOST: string = process.env.HOST || "0.0.0.0";

const checkPythonConnection = async () => {
  // Make sure to append /health to the base URL
  const url = `${process.env.LOGIC_SERVER_URL}/health`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "online") {
      console.log("✅ Python Logic Server is healthy and responding.");
    }
  } catch (err: any) {
    console.error("❌ Bridge Failed: Node cannot reach Python at " + url);
    console.error("   Reason: " + (err.response?.statusText || err.message));
  }
};

export default app;

// Use this block ONLY for local development
if (process.env.NODE_ENV !== "production") {
  const PORT: number = parseInt(process.env.PORT || "4000", 10);
  const HOST: string = process.env.HOST || "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Orchestrator running on http://${HOST}:${PORT}`);
    checkPythonConnection();
  });
}
