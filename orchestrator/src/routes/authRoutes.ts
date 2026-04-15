// src/routes/auth.routes.ts (or similar)
import { Router, Request, Response } from "express";
import { ablyService } from "../infrastructure/realtime/AblyService";

const router = Router();

// We don't necessarily need a full Controller class for one line,
// but let's keep it consistent with your pattern:
router.get("/ably-token", async (req: Request, res: Response) => {
  try {
    const tokenRequestData = await ablyService.createTokenRequest();
    res.json(tokenRequestData);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate Ably token" });
  }
});

export default router;
