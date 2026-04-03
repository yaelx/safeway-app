import { Router, Request, Response } from "express";
import { RoutingController } from "../controllers/routingController";
import { RoutingService } from "../services/routingService";
import { prisma } from "../config/db";
import { authProvider } from "../infrastructure/auth/authProvider";
import { IRoutingRequest, IRoutingResponse } from "../types/types";

const router = Router();
const routingService = new RoutingService(prisma, authProvider);
const routingController = new RoutingController(routingService);

// The endpoint is now just "/" because it's prefixed in server.ts
router.get(
  "/",
  (
    req: Request<any, any, any, IRoutingRequest>,
    res: Response<IRoutingResponse | { error: string }>,
  ) => routingController.getSafeRoute(req, res),
);

export default router;
