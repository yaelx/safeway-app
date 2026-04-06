import express from "express";
import { ContactService } from "../services/contactService";
import { ContactController } from "../controllers/contactController";

const router = express.Router();

const contactService = new ContactService();
const contactController = new ContactController(contactService);

router.post("/", contactController.sendMessage);

export default router;
