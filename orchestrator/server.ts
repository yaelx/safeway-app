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
  LOCAL_URL,
  PRODUCTION_URL,
  API_ENDPOINTS,
} from "./src/config/constants";

dotenv.config();

const app = express();
// Sets secure HTTP headers (hides Express, prevents clickjacking
app.use(helmet());
// "Digital ID" Check
const allowedOrigins = [PRODUCTION_URL, LOCAL_URL];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      // OR if the origin is in our whitelist
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS - Nice try!"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

const limiter = isRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 10, // Limit each IP to 10 requests per window
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after a minute.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Trust Proxy - from Google/Vercel IP. so won't block users.
app.set("trust proxy", 1);
// Apply the limiter specifically to routing endpoint
app.use(API_ENDPOINTS.SAFE_ROUTE, limiter);

app.use(express.json());
app.use(API_ENDPOINTS.SHELTERS, shelterRoutes);
app.use(API_ENDPOINTS.SAFE_ROUTE, routingRoutes);

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
    console.log("GOOGLE SAYS:", err.response.data);
  }
};

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
