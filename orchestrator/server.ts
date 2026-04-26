import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import helmet from "helmet";
import timeout from "connect-timeout";
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
const allowedOrigins = [PRODUCTION_URL, LOCAL_URL];
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // ALLOW VERCEL PREVIEW URLS
      const isVercelPreview =
        /^https:\/\/safeway-app-git-.*-yaelxs-projects\.vercel\.app$/.test(
          origin,
        );
      if (isVercelPreview) return callback(null, true);

      logger.warn(
        { event: "CORS_BLOCKED", origin },
        "Origin rejected by CORS policy",
      );

      // We send a more descriptive error back to the logs
      return callback(
        new Error(`CORS Reject: ${origin} is not authorized.`),
        false,
      );
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Key-Time"],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers need this for OPTIONS
    exposedHeaders: ["X-Key-Time"],
  }),
);

// IMPORTANT: Explicitly handle OPTIONS preflight globally
app.options("*", cors());

// Trust Proxy - from Google/Vercel IP. so won't block users.
app.set("trust proxy", 1);
// Create the isolated scope for the request.
app.use((req, res, next) => {
  const headerValue = req.headers["x-request-id"];
  const requestId =
    typeof headerValue === "string"
      ? headerValue
      : Array.isArray(headerValue)
        ? headerValue[0]
        : crypto.randomUUID();
  const store = new Map<string, string>();
  store.set("requestId", requestId);
  // this creates a unique, isolated pocket of memory for that specific request.
  asyncStorage.run(store, () => next());
});

// a custom middleware to verify requests
const authorizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Allow pre-flight requests (OPTIONS) automatically
  if (req.method === "OPTIONS") {
    return next();
  }
  const origin = req.headers.origin;
  if (origin && (origin === PRODUCTION_URL || origin.endsWith(".vercel.app"))) {
    next();
  } else {
    res.status(403).send("Unauthorized Origin");
  }
};
app.use(express.json());

app.use(timeout("10s")); // adjust to your needs

app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.timedout) next();
});

// 1. General API Protection (Applied to everything starting with /api)
// This acts as a "Catch-all" for your database-heavy endpoints
app.use("/api", apiLimiter);
app.use(authorizeRequest);
app.get("/", (req, res) => {
  res.json({ status: "Orchestrator is running", region: "me-west1" });
});
// 2. Strict Protection (Specifically for the OSRM/Python logic)
// Since API_ENDPOINTS.SAFE_ROUTE is "/api/get-safe-route",
// this limiter will stack on top of the general apiLimiter.
app.use(API_ENDPOINTS.SAFE_ROUTE, strictLimiter);
app.use(API_ENDPOINTS.SHELTERS, shelterRoutes);
app.use(API_ENDPOINTS.SAFE_ROUTE, routingRoutes);
app.use(API_ENDPOINTS.CONTACT, contactRoutes);
app.use(API_ENDPOINTS.AUTH, ablyRoutes);

// Add this LAST in your Express app, after all routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    event: "UNHANDLED_ROUTE_ERROR",
    path: req.path,
    method: req.method,
    error: err?.message,
    stack: err?.stack,
  });

  if (res.headersSent) return; // already responded, can't do anything

  if (req.timedout) {
    res.status(503).json({ error: "Request timed out. Please try again." });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    path: req.path,
  });
});

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
      logger.info(
        { event: "PYTHON_HEALTH_OK", healthUrl },
        "Python Logic Server is healthy",
      );
    }
  } catch (err: any) {
    logger.error(
      {
        event: "PYTHON_HEALTH_FAIL",
        healthUrl,
        reason: err.response?.statusText || err.message,
        googleSays: err.response?.data ?? null,
        err,
      },
      "Node cannot reach Python Logic Server",
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
      .then(() =>
        logger.info({ event: "DB_CONNECTED" }, "Prisma connected to database"),
      )
      .catch((err) =>
        logger.error(
          { event: "DB_CONNECT_FAIL", err },
          "Prisma connection failed",
        ),
      );
  } catch (err) {
    logger.error(
      { event: "BOOT_CRITICAL_FAIL", err },
      "Critical infrastructure failure at startup",
    );
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
  logger.info(
    { event: "SERVER_START", host: HOST, port: PORT },
    "Orchestrator is listening",
  );
  if (process.env.NODE_ENV !== "production") {
    checkPythonConnection();
  }
});
