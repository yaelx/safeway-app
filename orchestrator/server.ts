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
import { prisma } from "./src/config/db";
import { asyncStorage, logger } from "./src/middleware/logger";

dotenv.config();

const app = express();
// Sets secure HTTP headers (hides Express, prevents clickjacking
app.use(helmet());
// "Digital ID" Check
const allowedOrigins = [
  PRODUCTION_URL,
  LOCAL_URL,
  "https://safeway-app-git-feature-safeway-e2e-integration-yaelxs-projects.vercel.app",
];
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
      logger.warn({ event: 'CORS_BLOCKED', origin }, 'Origin rejected by CORS policy');

      // We send a more descriptive error back to the logs
      return callback(
        new Error(`CORS Reject: ${origin} is not authorized.`),
        false,
      );
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

// Trust Proxy - from Google/Vercel IP. so won't block users.
app.set("trust proxy", 1);
// 1. General API Protection (Applied to everything starting with /api)
// This acts as a "Catch-all" for your database-heavy endpoints
app.use("/api", apiLimiter);
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  const store = new Map();
  store.set("requestId", requestId);

  // Wrap the entire request execution in this storage context
  asyncStorage.run(store, () => next());
});

app.get("/", (req, res) => {
  res.json({ status: "Orchestrator is running", region: "me-west1" });
});
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
      logger.info({ event: 'PYTHON_HEALTH_OK', healthUrl }, 'Python Logic Server is healthy');
    }
  } catch (err: any) {
    logger.error(
      { event: 'PYTHON_HEALTH_FAIL', healthUrl, reason: err.response?.statusText || err.message, googleSays: err.response?.data ?? null, err },
      'Node cannot reach Python Logic Server',
    );
  }
};

process.on("SIGTERM", async () => {
  if (kafkaRouteProducer) await kafkaRouteProducer.disconnect();
  process.exit(0);
});

const initInfrastructure = async () => {
  try {
    await initMessaging(); // One call, clean and organized
    await prisma
      .$connect()
      .then(() => logger.info({ event: 'DB_CONNECTED' }, 'Prisma connected to database'))
      .catch((err) => logger.error({ event: 'DB_CONNECT_FAIL', err }, 'Prisma connection failed'));
  } catch (err) {
    logger.error({ event: 'BOOT_CRITICAL_FAIL', err }, 'Critical infrastructure failure at startup');
    process.exit(1);
  }
};

initInfrastructure();

export default app;

// ─── Server Startup ───────────────────────────────────────────────────────────
// Cloud Run injects PORT=8080.
// app.listen must run unconditionally so Cloud Run's health check succeeds.
const PORT: number = parseInt(process.env.PORT || "8080", 10);
const HOST: string = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  logger.info({ event: 'SERVER_START', host: HOST, port: PORT }, 'Orchestrator is listening');
  if (process.env.NODE_ENV !== "production") {
    checkPythonConnection();
  }
});
