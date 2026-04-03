import { Request, Response } from "express";
import { ShelterService } from "../services/shelterService";

export class ShelterController {
  constructor(private shelterService: ShelterService) {}

  async getSheltersInBounds(req: Request, res: Response) {
    try {
      const { minLat, maxLat, minLng, maxLng } = req.query as any;
      const shelters = await this.shelterService.getSheltersInBounds(
        minLat,
        maxLat,
        minLng,
        maxLng,
      );
      res.json({ shelters });
    } catch (e: any) {
      res
        .status(500)
        .json({ error: "Failed to fetch shelters", details: e.message });
    }
  }

  async add(req: Request, res: Response) {
    try {
      const result = await this.shelterService.addShelter(req.body);
      res.status(201).json(result);
    } catch (e) {
      res.status(500).json({ error: "Failed to add shelter" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await this.shelterService.updateShelter(
        Number(req.params.id),
        req.body,
      );
      res.json(result);
    } catch (e) {
      res.status(404).json({ error: "Shelter not found" });
    }
  }

  async report(req: Request, res: Response) {
    try {
      const { shelterId, reason, comment } = req.body;
      const result = await this.shelterService.createReport(
        Number(shelterId),
        reason,
        comment,
      );
      res.status(202).json(result);
    } catch (e) {
      res.status(500).json({ error: "Failed to submit report" });
    }
  }
}
