import { Router, Request, Response } from "express";
import { RoutingController } from "../controllers/routingController";
import { RoutingService } from "../services/routingService";
import { prisma } from "../config/db";
import { authProvider } from "../infrastructure/auth/authProvider";
import { validate } from "../middleware/validate";
import { routeSchema } from "../schemas/routeSchema";

const router = Router();
const routingService = new RoutingService(prisma, authProvider);
const routingController = new RoutingController(routingService);

// The endpoint is now just "/" because it's prefixed in server.ts
router.get(
  "/",
  validate(routeSchema),
  // Remove the complex generic types here. Express handles them better if we stay simple.
  (req: Request, res: Response) => routingController.getSafeRoute(req, res),
);

export default router;
