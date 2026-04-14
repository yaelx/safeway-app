import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import helmet from "helmet";
import isRateLimit from "express-rate-limit";
import shelterRoutes from "./src/routes/shelterRoutes";
import routingRoutes from "./src/routes/routingRoutes";
import { authProvider } from "./src/infrastructure/auth/authProvider";
import {
  initMessaging,
  kafkaRouteProducer,
} from "./src/infrastructure/messaging";
import {
  LOCAL_URL,
  PRODUCTION_URL,
  API_ENDPOINTS,
} from "./src/config/constants";
import { apiLimiter, strictLimiter } from "./src/middleware/rateLimiter";
import contactRoutes from "./src/routes/contactRoutes";
import ablyRoutes from "./src/routes/authRoutes";

dotenv.config();

const app = express();
// Sets secure HTTP headers (hides Express, prevents clickjacking
app.use(helmet());
// "Digital ID" Check
const allowedOrigins = [PRODUCTION_URL, LOCAL_URL];
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // 1. Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // 2. Check if the origin is in our static whitelist
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // 3. ALLOW VERCEL PREVIEW URLS
      // This Regex allows any URL ending in .vercel.app that belongs to your project
      const isVercelPreview =
        /^https:\/\/safeway-app-git-.*-yaelxs-projects\.vercel\.app$/.test(
          origin,
        );

      if (isVercelPreview) {
        return callback(null, true);
      }

      // 4. INFORMATIVE ERROR: Tell yourself exactly what went wrong
      console.error(
        `[CORS Blocked]: Origin "${origin}" is not in whitelist or allowed patterns.`,
      );

      // We send a more descriptive error back to the logs
      return callback(
        new Error(`CORS Reject: ${origin} is not authorized.`),
        false,
      );
    },
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

// Trust Proxy - from Google/Vercel IP. so won't block users.
app.set("trust proxy", 1);
// 1. General API Protection (Applied to everything starting with /api)
// This acts as a "Catch-all" for your database-heavy endpoints
app.use("/api", apiLimiter);
// 2. Strict Protection (Specifically for the OSRM/Python logic)
// Since API_ENDPOINTS.SAFE_ROUTE is "/api/get-safe-route",
// this limiter will stack on top of the general apiLimiter.
app.use(API_ENDPOINTS.SAFE_ROUTE, strictLimiter);

app.use(express.json());
app.use(API_ENDPOINTS.SHELTERS, shelterRoutes);
app.use(API_ENDPOINTS.SAFE_ROUTE, routingRoutes);
app.use(API_ENDPOINTS.CONTACT, contactRoutes);
app.use(API_ENDPOINTS.AUTH, ablyRoutes);

// ─── Python Health Check ──────────────────────────────────────────────────────
const checkPythonConnection = async () => {
  const healthUrl = `${process.env.LOGIC_SERVER_URL}/health`;
  try {
    const token = await authProvider.getAccessToken();

    // 3. Call with the Authorization header
    const response = await axios.get(healthUrl, {
      headers: { Authorization: token },
    });

    if (response.data.status === "online") {
      console.log("✅ Python Logic Server is healthy and responding.");
    }
  } catch (err: any) {
    console.error(
      "❌ Bridge Failed: Node cannot reach Python at: " + healthUrl,
    );
    console.error("   Reason: " + (err.response?.statusText || err.message));
    console.log(
      "GOOGLE SAYS:",
      err.response?.data || "No response data available",
    );
  }
};

process.on("SIGTERM", async () => {
  await kafkaRouteProducer.disconnect();
  process.exit(0);
});

const initInfrastructure = async () => {
  try {
    await initMessaging(); // One call, clean and organized
    // ... other inits (Prisma, etc.)
  } catch (err) {
    console.error("Critical Failure:", err);
    process.exit(1);
  }
};

initInfrastructure();

export default app;

// ─── Local Dev Server ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT: number = parseInt(process.env.PORT || "4000", 10);
  const HOST: string = process.env.HOST || "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Orchestrator running on http://${HOST}:${PORT}`);
    checkPythonConnection();
  });
}
