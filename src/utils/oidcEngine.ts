export interface PkcePair {
  verifier: string;
  challenge: string;
  method: 'S256' | 'plain';
}

export function generateRandomString(length: number = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }
  return result;
}

export async function generatePkcePair(verifierLength: number = 64): Promise<PkcePair> {
  const verifier = generateRandomString(verifierLength);
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);

  // Base64URL encode the digest
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
  const challenge = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return {
    verifier,
    challenge,
    method: 'S256',
  };
}

export interface OidcAuthConfig {
  issuer: string;
  authEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  responseType: string;
  state: string;
  nonce: string;
  codeVerifier: string;
  codeChallenge: string;
}

export function buildAuthorizeUrl(config: Partial<OidcAuthConfig>): string {
  const base = config.authEndpoint || 'https://auth.example.com/oauth2/v1/authorize';
  try {
    const url = new URL(base);
    if (config.clientId) url.searchParams.set('client_id', config.clientId);
    if (config.redirectUri) url.searchParams.set('redirect_uri', config.redirectUri);
    if (config.responseType) url.searchParams.set('response_type', config.responseType);
    if (config.scope) url.searchParams.set('scope', config.scope);
    if (config.state) url.searchParams.set('state', config.state);
    if (config.nonce) url.searchParams.set('nonce', config.nonce);
    if (config.codeChallenge) {
      url.searchParams.set('code_challenge', config.codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
    }
    return url.toString();
  } catch {
    return base;
  }
}

export function generateMockOidcTokens(params: {
  sub: string;
  name: string;
  email: string;
  issuer: string;
  clientId: string;
  roles?: string[];
}) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: 'key_' + Math.random().toString(36).substring(2, 8),
  };

  const idTokenPayload = {
    iss: params.issuer || 'https://auth.webcoder.tools',
    sub: params.sub || 'usr_83921f0a82',
    aud: params.clientId || 'webcoder-client-app',
    exp,
    iat: now,
    auth_time: now,
    name: params.name || 'Developer User',
    email: params.email || 'developer@webcoder.tools',
    email_verified: true,
    roles: params.roles || ['admin', 'engineer'],
  };

  const base64Url = (obj: any) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const idToken = `${base64Url(header)}.${base64Url(idTokenPayload)}.mock_sig_${generateRandomString(32)}`;
  const accessToken = `at_live_${generateRandomString(40)}`;
  const refreshToken = `rt_live_${generateRandomString(48)}`;

  return {
    idToken,
    accessToken,
    refreshToken,
    expiresIn: 3600,
    tokenType: 'Bearer',
  };
}
