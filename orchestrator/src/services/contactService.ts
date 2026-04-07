import nodemailer from "nodemailer";
import xss from "xss";
import sharp from "sharp";
import { svgLogo } from "../config/logo_str";

export class ContactService {
  private transporter;

  constructor() {
    // 1. Create the transporter
    // For Gmail, you'll need an "App Password" (not your regular password)
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your email: e.g., yael@gmail.com
        pass: process.env.EMAIL_PASS, // your 16-character App Password
      },
    });
  }

  async processMessage(data: {
    name: string;
    email: string;
    message: string;
    subject: string;
    honeypot?: string;
  }) {
    // Validation
    if (!data.name || !data.email || !data.message) {
      throw new Error("All fields are required");
    }

    // If this field is filled, it's 100% a bot because the field is hidden from humans.
    if (data.honeypot && data.honeypot.length > 0) {
      console.log("[Security] Bot detected and ignored via Honeypot.");
      return { success: true }; // "Fake" success
    }

    const clean = {
      name: xss(data.name),
      email: xss(data.email),
      message: xss(data.message),
      subject: xss(data.subject),
    };

    const logoBuffer = await sharp(Buffer.from(svgLogo.trim()))
      .resize(400) // Set a width of 400px for high-density (Retina) displays
      .png()
      .toBuffer();

    try {
      // EMAIL A: Send the Alert to YOUR inbox
      await this.transporter.sendMail({
        from: `"SafeWay System" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Your personal email or the project email
        replyTo: clean.email, // Allows you to hit 'Reply' directly to the user
        subject: `New SafeWay Inquiry: ${clean.subject}`,
        attachments: [
          {
            filename: "logo.png",
            content: logoBuffer,
            cid: "safeway_logo",
            contentType: "image/png",
          },
        ],
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <div style="padding: 40px 20px; border-bottom: 1px solid #f1f5f9;">
                <h2 style="color: #3b82f6;">New Message Received</h2>
                <p><strong>From:</strong> ${clean.name} (${clean.email})</p>
                <p><strong>Subject:</strong> ${clean.subject}</p>
                <hr />
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${clean.message}</p>

                <div style="padding: 30px 20px; text-align: center; background-color: #fafafa;">
                    <img src="cid:safeway_logo" width="120" alt="SafeWay Israel Logo" style="opacity: 0.9;" />
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
                        This is an automated response to your inquiry. Please do not reply directly to this email.
                    </p>
                </div>
            </div>
        </div>
        `,
      });

      // Send the "Thank You" receipt to the USER
      await this.transporter.sendMail({
        from: `"SafeWay Israel" <${process.env.EMAIL_USER}>`,
        to: clean.email, // Send back to the user
        attachments: [
          {
            filename: "logo.png",
            content: logoBuffer,
            cid: "safeway_logo",
            contentType: "image/png",
          },
        ],
        subject: "We've received your message - SafeWay Israel",
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">

            <div style="padding: 40px 20px; border-bottom: 1px solid #f1f5f9;">
                <h2 style="color: #1a365d; margin-top: 0; font-size: 24px;">Hi ${clean.name},</h2>

                <p style="font-size: 16px;">
                    Thank you for reaching out to us. We have received your message regarding
                    <strong style="color: #2b6cb0;">"${clean.subject}"</strong> and our team will get back to you as soon as possible.
                </p>

                <p style="font-size: 16px; margin-bottom: 30px;">
                    Stay safe,<br>
                    <strong>The SafeWay Team</strong>
                </p>
            </div>

            <div style="padding: 30px 20px; text-align: center; background-color: #fafafa;">
                <img src="cid:safeway_logo" width="120" alt="SafeWay Israel Logo" style="opacity: 0.9;" />
                <p style="font-size: 12px; color: #94a3b8; margin-top: 15px; margin-left: 5px;">
                    This is an automated response to your inquiry. Please do not reply directly to this email.
                </p>
            </div>
        </div>
        `,
      });
      console.log(
        `[ContactService] Email sent successfully from: ${clean.email}`,
      );
      return { success: true, message: "Email sent successfully." };
    } catch (error) {
      console.error("[ContactService] Nodemailer Error:", error);
      throw new Error("Failed to send email. Please try again later.");
    }
  }
}
