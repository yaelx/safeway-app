import { GoogleAuthenticator } from "./GoogleAuthenticator";
import { LocalAuthenticator } from "./LocalAuthenticator";
import dotenv from "dotenv";

dotenv.config();
const IAM_AUDIENCE = process.env.IAM_AUDIENCE!;
const isLocal = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

export const authProvider = isLocal
  ? new GoogleAuthenticator(IAM_AUDIENCE)
  : new LocalAuthenticator(IAM_AUDIENCE);
