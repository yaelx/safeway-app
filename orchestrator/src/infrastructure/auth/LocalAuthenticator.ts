import { GoogleAuth } from "google-auth-library";
import { IAuthenticator } from "./IAuthenticator";

export class LocalAuthenticator implements IAuthenticator {
  private auth: GoogleAuth;
  private targetAudience: string;

  constructor(targetAudience: string) {
    // This looks for the JSON key path in your .env
    this.auth = new GoogleAuth();
    this.targetAudience = targetAudience;
  }

  async getAccessToken(): Promise<string> {
    try {
      const client = await this.auth.getIdTokenClient(this.targetAudience);
      const headers = await client.getRequestHeaders();
      return headers.get("Authorization") || "";
    } catch (err) {
      console.error(
        "Local Auth Failed: Ensure GOOGLE_APPLICATION_CREDENTIALS is set.",
      );
      throw err;
    }
  }
}
