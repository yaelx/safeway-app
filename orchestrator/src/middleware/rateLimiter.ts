import isRateLimit from "express-rate-limit";
import { UpstashRateLimitStore } from "../infrastructure/cache/RateLimitStore";

/**
 * Factory to create a persistent limiter tier
 * By using new UpstashRateLimitStore() inside the factory, you ensure:
 * 1. Isolation: The routing limiter doesn't interfere with the shelter limiter.
 * 2. Correct Headers: The X-RateLimit-Remaining header will show the correct count for that specific endpoint.
 */
const createLimiter = (maxRequests: number, windowMinutes: number = 1) => {
  return isRateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    // FIX: Create a NEW instance for every limiter call
    store: new UpstashRateLimitStore(),
    message: {
      error: "Too many requests. Please slow down.",
      limit: maxRequests,
    },
  });
};

export const strictLimiter = createLimiter(10);
export const apiLimiter = createLimiter(60);
