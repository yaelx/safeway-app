import * as Ably from "ably";

const apiKey = import.meta.env.VITE_ABLY_KEY;

if (!apiKey) {
  console.error(
    "❌ Ably API Key is missing! Check your .env file and restart Vite.",
  );
}

export const ably = new Ably.Realtime({
  key: apiKey,
});
