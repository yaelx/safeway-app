export interface IAuthenticator {
  getAccessToken(): Promise<string>;
}
