import { Router } from "express";
import { ShelterController } from "../controllers/shelterController";
import { ShelterService } from "../services/shelterService";
import { prisma } from "../config/db";

const router = Router();
const service = new ShelterService(prisma);
const controller = new ShelterController(service);

// Discovery & Map
router.post("/in-bounds", (req, res) =>
  controller.getSheltersInBounds(req, res),
);

// Management (CRUD & Reports)
router.post("/", (req, res) => controller.add(req, res));
router.patch("/:id", (req, res) => controller.update(req, res));
router.post("/report", (req, res) => controller.report(req, res));

export default router;
