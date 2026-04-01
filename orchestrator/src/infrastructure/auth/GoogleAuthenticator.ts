// src/infrastructure/auth/GoogleAuthenticator.ts
import { GoogleAuth } from "google-auth-library";
import { IAuthenticator } from "./IAuthenticator";

export class GoogleAuthenticator implements IAuthenticator {
  private auth: GoogleAuth;
  private targetAudience: string;

  constructor(targetAudience: string) {
    this.auth = new GoogleAuth();
    this.targetAudience = targetAudience;
  }

  /**
   * Returns a valid OIDC ID Token (the "Pass-Card").
   * This handles caching and refreshing automatically.
   */
  async getAccessToken(): Promise<string> {
    const client = await this.auth.getIdTokenClient(this.targetAudience);
    const headers = await client.getRequestHeaders();
    // returns the string: "Bearer eyJhbG..."
    return headers.get("Authorization") || "";
  }
}
