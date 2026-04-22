import * as Ably from "ably";
import { IRealtimeService } from "./types";
import dotenv from "dotenv";
import { logger } from "../../middleware/logger";

dotenv.config();

export class AblyService implements IRealtimeService {
  private rest: Ably.Rest;

  constructor() {
    const apiKey = process.env.ABLY_API_KEY;
    if (!apiKey) {
      logger.warn(
        { event: "ABLY_KEY_MISSING" },
        "ABLY_API_KEY is not set — real-time updates will not work",
      );
    }
    this.rest = new Ably.Rest({ key: apiKey });
  }

  async publish(requestId: string, eventName: string, data: any) {
    try {
      const channel = this.rest.channels.get(`route-status:${requestId}`);
      // The REST publish is a simple HTTP request
      await channel.publish(eventName, data);
      logger.info(
        { event: "ABLY_PUBLISH_OK", requestId, eventName },
        `Ably published successfully event: ${eventName}`,
      );
    } catch (error) {
      logger.error(
        { event: "ABLY_PUBLISH_ERROR", requestId, eventName, err: error },
        "Ably publish failed",
      );
    }
  }

  async publishStatus(requestId: string, status: string, message: string) {
    await this.publish(requestId, "status_update", { status, message });
  }

  async publishResult(requestId: string, routes: any) {
    await this.publish(requestId, "result_ready", { routes });
  }

  async createTokenRequest() {
    // Use 'safeway-user' or pull a real ID from the request if you have auth
    return await this.rest.auth.createTokenRequest({
      clientId: "safeway-user",
      // ttl: 7200000, 2 hours
    });
  }
}

export const ablyService = new AblyService();
