import * as Ably from "ably";

const baseUrl = import.meta.env.VITE_API_URL;

if (!baseUrl) {
  console.error(
    "❌ API URL is missing! Check your .env file and restart Vite.",
  );
}

export const ably = new Ably.Realtime({
  authUrl: `${baseUrl}/api/auth/ably-token`,
});
