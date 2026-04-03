import { Store, Options, ClientRateLimitInfo } from "express-rate-limit";
import { RedisCache } from "./RedisCache";

export class UpstashRateLimitStore implements Store {
  private cache: RedisCache;

  constructor() {
    this.cache = new RedisCache();
  }

  // express-rate-limit calls internally
  async increment(key: string): Promise<ClientRateLimitInfo> {
    const current = (await this.cache.getRaw(key)) || 0;
    // Ensure we treat null/undefined as 0
    const nextCount = (typeof current === "number" ? current : 0) + 1;

    // set the TTL to 1 minute (60s) for the limit window
    await this.cache.setRaw(key, nextCount, 60);

    return {
      totalHits: nextCount,
      resetTime: new Date(Date.now() + 60 * 1000), // Approximate reset
    };
  }

  async decrement(key: string): Promise<void> {
    const current = await this.cache.getRaw(key);
    if (typeof current === "number" && current > 0) {
      await this.cache.setRaw(key, current - 1, 60);
    }
  }

  async resetKey(key: string): Promise<void> {
    await this.cache.setRaw(key, 0, 0); // Effectively deletes it
  }
}
