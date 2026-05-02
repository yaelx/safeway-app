import {
  NextFunction,
  Request,
  Response,
  RequestHandler,
  Router,
} from "express";
import { ShelterController } from "../controllers/shelterController";
import { ShelterService } from "../services/shelterService";
import { prisma } from "../config/db";
import { API_ENDPOINTS } from "../config/constants";
import { validate } from "../middleware/validate";
import { getInBoundsSchema } from "../schemas/shelterInBoundsSchema";

const router = Router();
const service = new ShelterService(prisma);
const controller = new ShelterController(service);

export const safe =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  ): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

// Discovery & Map
router.post(
  API_ENDPOINTS.SHELTERS_IN_BOUNDS,
  validate(getInBoundsSchema),
  safe(async (req, res) => controller.getSheltersInBounds(req, res)),
);

// Management (CRUD & Reports)
router.post("/", (req, res) => controller.add(req, res));
router.patch("/:id", (req, res) => controller.update(req, res));
router.post("/report", (req, res) => controller.report(req, res));

export default router;
