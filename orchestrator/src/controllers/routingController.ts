import { Request, Response } from "express";
import { RoutingService } from "../services/routingService";
import { IRoutingRequest, IRoutingResponse } from "../types/types";

export class RoutingController {
  constructor(private routingService: RoutingService) {}

  async getSafeRoute(
    req: Request<any, any, any, IRoutingRequest>,
    res: Response<IRoutingResponse | { error: string }>,
  ) {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing coords" });
    }

    try {
      const result: IRoutingResponse = await this.routingService.getSafeRoutes(
        start,
        end,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Error evaluating route:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}
