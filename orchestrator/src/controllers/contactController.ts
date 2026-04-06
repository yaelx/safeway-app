import { Request, Response } from "express";
import { ContactService } from "../services/contactService";

export class ContactController {
  constructor(private contactService: ContactService) {}

  sendMessage = async (req: Request, res: Response) => {
    try {
      const result = await this.contactService.processMessage(req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
