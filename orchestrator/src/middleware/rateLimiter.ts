import isRateLimit from "express-rate-limit";
import { RedisCache } from "../infrastructure/cache/RedisCache";

const cache = new RedisCache();

export const createLimiter = (
  maxRequests: number,
  windowMinutes: number = 1,
) => {
  return isRateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    // Custom store using your Upstash REST client
    handler: async (req, res, next, options) => {
      const key = `rate-limit:${req.ip}`;

      // 1. Get current count from Redis
      const currentUsage = (await cache.getRaw(key)) || 0;

      if (currentUsage >= maxRequests) {
        return res
          .status(429)
          .json({ error: "Too many requests. Please slow down." });
      }

      // 2. Increment and set TTL (windowMinutes converted to seconds)
      await cache.setRaw(key, currentUsage + 1, windowMinutes * 60);

      next();
    },
  });
};

export const strictLimiter = createLimiter(10);
export const apiLimiter = createLimiter(60);
