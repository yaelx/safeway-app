import { GoogleAuth } from "google-auth-library";
import { IAuthenticator } from "./IAuthenticator";
import { logger } from "../../middleware/logger";

export class LocalAuthenticator implements IAuthenticator {
  private auth: GoogleAuth;
  private targetAudience: string;

  constructor(targetAudience: string) {
    // This looks for the JSON key path in your .env
    this.auth = new GoogleAuth();
    this.targetAudience = targetAudience;

    const jsonKey = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (jsonKey) {
      // PROD/VERCEL: Use the raw JSON string from the env var
      const credentials = JSON.parse(jsonKey);
      this.auth = new GoogleAuth({
        credentials,
        projectId: credentials.project_id,
      });
    } else {
      // DEV/MAC: Uses the file path from GOOGLE_APPLICATION_CREDENTIALS automatically
      this.auth = new GoogleAuth();
    }
  }

  async getAccessToken(): Promise<string> {
    try {
      const client = await this.auth.getIdTokenClient(this.targetAudience);
      const headers = await client.getRequestHeaders();
      // ALREADY returns { "Authorization": "Bearer eyJ..." }
      return headers.get("Authorization") || "";
    } catch (err) {
      const msg =
        "Local Auth Failed: Ensure GOOGLE_APPLICATION_CREDENTIALS is set.";
      logger.error({ event: 'IAM_TOKEN_FAIL', err }, msg);
      throw new Error(msg);
    }
  }
}
