import pino from "pino";
import { AsyncLocalStorage } from "async_hooks";

// The "Magic" storage that tracks the request across the whole thread
export const asyncStorage = new AsyncLocalStorage<Map<string, string>>();

export const logger = pino({
  mixin() {
    // This automatically adds the requestId to EVERY log line
    const store = asyncStorage.getStore();
    return { requestId: store?.get("requestId") };
  },
  base: { service: "safeway-orchestrator" },
});
