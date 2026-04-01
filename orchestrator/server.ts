import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import shelterRoutes from "./src/routes/shelterRoutes";
import routingRoutes from "./src/routes/routingRoutes";
import { authProvider } from "./src/infrastructure/auth/authProvider";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Shelter CRUD & Reporting Endpoints ──────────────────────────────────────
app.use("/api/shelters", shelterRoutes);
app.use("/api/get-safe-route", routingRoutes);

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
