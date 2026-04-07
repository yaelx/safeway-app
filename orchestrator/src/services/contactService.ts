import nodemailer from "nodemailer";
import xss from "xss";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import handlebars from "handlebars";
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

  private async sendTemplatedEmail(options: {
    to: string;
    subject: string;
    templateName: string;
    context: object;
    logoBuffer: Buffer;
    replyTo?: string;
  }) {
    const templatePath = path.join(
      __dirname,
      `../templates/${options.templateName}.hbs`,
    );
    const source = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(source);
    const html = template(options.context);

    await this.transporter.sendMail({
      from: `"SafeWay Israel" <${process.env.EMAIL_USER}>`,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      attachments: [
        {
          filename: "logo.png",
          content: options.logoBuffer,
          cid: "safeway_logo",
          contentType: "image/png",
        },
      ],
      html,
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

    try {
      // Prepare the high-res PNG logo once
      const logoBuffer = await sharp(Buffer.from(svgLogo.trim()))
        .resize(400)
        .png()
        .toBuffer();

      await Promise.all([
        // EMAIL A: To You (The Alert)
        this.sendTemplatedEmail({
          to: process.env.EMAIL_USER!,
          replyTo: clean.email,
          subject: `New SafeWay Inquiry: ${clean.subject}`,
          templateName: "self-contact-email",
          context: clean,
          logoBuffer,
        }),
        // EMAIL B: To User (The Receipt)
        this.sendTemplatedEmail({
          to: clean.email,
          subject: "We've received your message - SafeWay Israel",
          templateName: "contact-email",
          context: clean,
          logoBuffer,
        }),
      ]);

      return { success: true, message: "Emails sent." };
    } catch (error) {
      console.error("[ContactService] Error:", error);
      throw new Error("Dispatch failed.");
    }
  }
}
