import { Request, Response } from "express";
import { RoutingService } from "../services/routingService";

export class RoutingController {
  constructor(private routingService: RoutingService) {}

  async getSafeRoute(req: Request, res: Response) {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing coords" });
    }

    try {
      const result = await this.routingService.getSafeRoutes(
        start as string,
        end as string,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Error evaluating route:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}
