import isRateLimit from "express-rate-limit";
import { UpstashRateLimitStore } from "../infrastructure/cache/RateLimitStore";

const customStore = new UpstashRateLimitStore();

const createLimiter = (maxRequests: number, windowMinutes: number = 1) => {
  return isRateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true, // Professional X-RateLimit headers
    legacyHeaders: false,
    store: customStore,
    message: {
      error: "Too many requests. Please slow down.",
      limit: maxRequests,
    },
  });
};

export const strictLimiter = createLimiter(10);
export const apiLimiter = createLimiter(60);
