import express, { Request, Response } from "express";

const router = express.Router();

// Types for the incoming message
interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

router.post("/api/contact", async (req: Request, Response: Response) => {
  try {
    const { name, email, subject, message }: ContactMessage = req.body;

    // 1. Basic Validation
    if (!name || !email || !message) {
      return Response.status(400).json({
        error:
          "Missing required fields: name, email, and message are mandatory.",
      });
    }

    // 2. Logic (Integration point)
    // For now, we log it. Later, you'll plug in Nodemailer or SendGrid here.
    console.log(`📩 New Message from ${name} (${email}):`, {
      subject,
      message,
    });

    // 3. Success Response
    return Response.status(200).json({
      success: true,
      message: "Message received! We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact API Error:", error);
    return Response.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
});

export default router;
