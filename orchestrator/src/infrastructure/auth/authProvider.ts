import { GoogleAuthenticator } from "./GoogleAuthenticator";
import { LocalAuthenticator } from "./LocalAuthenticator";
import dotenv from "dotenv";

dotenv.config();

const IAM_AUDIENCE = process.env.BASE_IAM_URL!;
export const useRealAuth =
  process.env.NODE_ENV === "production" ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS;

export const authProvider = useRealAuth
  ? new GoogleAuthenticator(IAM_AUDIENCE)
  : new LocalAuthenticator(IAM_AUDIENCE);
