import { Router } from "express";
import { RoutingController } from "../controllers/routingController";
import { RoutingService } from "../services/routingService";
import { prisma } from "../config/db";
import { authProvider } from "../infrastructure/auth/authProvider";

const router = Router();
const routingService = new RoutingService(prisma, authProvider);
const routingController = new RoutingController(routingService);

// The endpoint is now just "/" because it's prefixed in server.ts
router.get("/", (req, res) => routingController.getSafeRoute(req, res));

export default router;
