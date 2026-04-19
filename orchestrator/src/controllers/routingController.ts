import { Request, Response } from "express";
import { RoutingService } from "../services/routingService";
import { IRoutingRequest } from "../types/types";
import { logger } from "../middleware/logger";

export class RoutingController {
  constructor(private routingService: RoutingService) {}

  async getSafeRoute(req: Request, res: Response<any | { error: string }>) {
    const { start, end } = req.query as unknown as IRoutingRequest;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing coords" });
    }

    try {
      const result = await this.routingService.getSafeRoutes(start, end);

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error({ event: 'ROUTE_EVAL_ERROR', start, end, err: error }, 'Failed to evaluate safe route');
      return res.status(500).json({ error: error.message });
    }
  }
}
