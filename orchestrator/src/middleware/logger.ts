import pino from "pino";
import { AsyncLocalStorage } from "async_hooks";

// The "Magic" storage that tracks the request across the whole thread
export const asyncStorage = new AsyncLocalStorage<Map<string, string>>();

export const logger = pino({
  // This ensures the level value (e.g., 'info') is converted to 'INFO'
  formatters: {
    level(label, number) {
      return { severity: label.toUpperCase() };
    },
  },

  mixin(_context, level) {
    const store = asyncStorage.getStore();
    const requestId = store?.get("requestId") || "NO_REQUEST_ID";
    return {
      requestId,
    };
  },
  messageKey: "message",
  base: { service: "safeway-orchestrator" },
});
