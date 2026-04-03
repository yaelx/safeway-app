import { Router } from "express";
import { ShelterController } from "../controllers/shelterController";
import { ShelterService } from "../services/shelterService";
import { prisma } from "../config/db";
import { API_ENDPOINTS } from "../config/constants";
import { validate } from "../middleware/validate";
import { getInBoundsSchema } from "../schemas/shelterSchema";

const router = Router();
const service = new ShelterService(prisma);
const controller = new ShelterController(service);

// Discovery & Map
router.post(
  API_ENDPOINTS.SHELTERS_IN_BOUNDS,
  validate(getInBoundsSchema),
  (req, res) => controller.getSheltersInBounds(req, res),
);

// Management (CRUD & Reports)
router.post("/", (req, res) => controller.add(req, res));
router.patch("/:id", (req, res) => controller.update(req, res));
router.post("/report", (req, res) => controller.report(req, res));

export default router;
