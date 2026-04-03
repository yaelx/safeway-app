import { Redis } from "@upstash/redis";

export class RedisCache {
  private redis: Redis;
  private readonly DEFAULT_TTL = 86400; // 24 hours in seconds

  constructor() {
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      throw new Error(
        "Missing Upstash Redis Credentials in Environment Variables",
      );
    }

    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  /**
   * Generic GET for non-route data (like Shelters)
   * @upstash/redis returns the parsed type (number/string/obj)
   */
  async getRaw(key: string): Promise<any | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error("[Cache] Redis Get Error:", error);
      return null;
    }
  }

  /**
   * Generic SET for non-route data
   */
  async setRaw(key: string, data: any, ttl = this.DEFAULT_TTL): Promise<void> {
    try {
      await this.redis.set(key, data, { ex: ttl });
    } catch (error) {
      console.error("[Redis] Set Error:", error);
    }
  }

  /**
   * Generates a unique key for a route.
   * Rounds to 5 decimal places (~1.1 meters precision).
   * This ensures that neighbors searching for the same shelter get the same cache key.
   */
  private generateKey(start: [number, number], end: [number, number]): string {
    const round = (num: number) => num.toFixed(5);
    return `route:${round(start[0])},${round(start[1])}:${round(end[0])},${round(end[1])}`;
  }

  async getRoute(
    start: [number, number],
    end: [number, number],
  ): Promise<any | null> {
    const key = this.generateKey(start, end);
    try {
      const data = await this.redis.get(key);
      if (data) {
        console.log(`[Cache] HIT for key: ${key}`);
        return data;
      }
      return null;
    } catch (error) {
      console.error("[Cache] Redis Get Error:", error);
      return null; // Fail gracefully: if cache is down, we just call the Python server
    }
  }

  async setRoute(
    start: [number, number],
    end: [number, number],
    data: any,
  ): Promise<void> {
    const key = this.generateKey(start, end);
    try {
      await this.redis.set(key, data, { ex: this.DEFAULT_TTL });
      console.log(`[Cache] SET successful for key: ${key}`);
    } catch (error) {
      console.error("[Cache] Redis Set Error:", error);
    }
  }
}
