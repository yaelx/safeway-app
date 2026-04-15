import * as Ably from "ably";
import { API_ENDPOINTS } from "../config/constants";

const baseUrl = import.meta.env.VITE_API_URL;

if (!baseUrl) {
  console.error(
    "❌ API URL is missing! Check your .env file and restart Vite.",
  );
}

export const ably = new Ably.Realtime({
  authUrl: `${API_ENDPOINTS.GET_ABLY_TOKEN}`,
});
