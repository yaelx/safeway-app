import { GoogleAuthenticator } from "./GoogleAuthenticator";
import { LocalAuthenticator } from "./LocalAuthenticator";
import dotenv from "dotenv";

dotenv.config();
const audience = process.env.IAM_AUDIENCE || "";

// If we are on Vercel or have a local key, we use the "Key-based" auth
const isExternal = !!(
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
);

const provider = isExternal
  ? new LocalAuthenticator(audience)
  : new GoogleAuthenticator(audience);

export const authProvider = provider;
