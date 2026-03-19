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
      console.log("Calling Python Solver at:", process.env.LOGIC_SERVER_URL);
      console.log("Calling OSRM with points:", start, end);

      const result = await this.routingService.getSafeRoute(
        start as string,
        end as string,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Error evaluating route:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }
}
