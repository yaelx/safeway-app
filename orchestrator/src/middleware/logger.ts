import pino from "pino";
import { AsyncLocalStorage } from "async_hooks";

// The "Magic" storage that tracks the request across the whole thread
export const asyncStorage = new AsyncLocalStorage<Map<string, string>>();

export const logger = pino({
  mixin() {
    // Extracts the ID from the isolated scope (built for each request) to label logs.
    const store = asyncStorage.getStore();
    return { requestId: store?.get("requestId") || "NO_REQUEST_ID" };
  },
  base: { service: "safeway-orchestrator" },
});
