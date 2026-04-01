import { GoogleAuthenticator } from "./GoogleAuthenticator";
import { LocalAuthenticator } from "./LocalAuthenticator";
import dotenv from "dotenv";

dotenv.config();

const routingServerUrl = process.env.LOGIC_SERVER_URL!;
export const useRealAuth =
  process.env.NODE_ENV === "production" ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS;

export const authProvider = useRealAuth
  ? new GoogleAuthenticator(routingServerUrl)
  : new LocalAuthenticator(routingServerUrl);
