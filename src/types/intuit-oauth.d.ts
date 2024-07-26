// src/types/intuit-oauth.d.ts
declare module 'intuit-oauth' {
  interface Token {
    access_token: string;
    refresh_token: string;
    [key: string]: any;
  }

  interface OAuthClientOptions {
    clientId: string;
    clientSecret: string;
    environment: string;
    redirectUri: string;
  }

  interface AuthorizeUriOptions {
    scope: string[];
    state: string;
  }

  class OAuthClient {
    static scopes: any;
    constructor(options: OAuthClientOptions);
    authorizeUri(options: AuthorizeUriOptions): string;
    createToken(authCode: string): Promise<{ token: Token }>;
    refreshUsingToken(refreshToken: string): Promise<{ token: Token }>;
    token: { setToken(token: Token): void; access_token: string; refresh_token: string; };
    [key: string]: any;
  }

  export default OAuthClient;
}