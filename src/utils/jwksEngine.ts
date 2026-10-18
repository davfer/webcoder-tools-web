import { networkTracker } from '../services/networkTracker';
import { JwkKey, JwksData, JwksValidationResult } from '../types';

export type { JwksData };

/**
 * Base64URL string to Uint8Array
 */
export function base64UrlToUint8Array(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Normalizes issuer URL
 */
export function normalizeIssuer(issuer: string): string {
  let cleaned = issuer.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned.replace(/\/+$/, '');
}

/**
 * Discover jwks_uri via OpenID Configuration
 */
export async function discoverJwksUri(issuer: string): Promise<{ jwksUri: string; discoveryUrl: string }> {
  const normIss = normalizeIssuer(issuer);
  const discoveryUrl = `${normIss}/.well-known/openid-configuration`;

  const res = await networkTracker.trackRequest<any>(discoveryUrl, 'OIDC DISCOVERY GET', async () => {
    const response = await fetch(discoveryUrl, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Discovery endpoint returned HTTP ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return {
      response,
      data,
      details: `Retrieved openid-configuration from ${discoveryUrl}`,
    };
  });

  if (res.error || !res.data?.jwks_uri) {
    throw new Error(res.error || 'OpenID configuration does not contain a jwks_uri');
  }

  return {
    jwksUri: res.data.jwks_uri,
    discoveryUrl,
  };
}

/**
 * Fetch and validate RFC 7517 compliant JWKS
 */
export async function fetchJwks(jwksUri: string): Promise<JwksData> {
  const res = await networkTracker.trackRequest<JwksData>(jwksUri, 'JWKS GET', async () => {
    const response = await fetch(jwksUri, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`JWKS endpoint returned HTTP ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return {
      response,
      data,
      details: `Retrieved JWKS with ${data?.keys?.length || 0} keys from ${jwksUri}`,
    };
  });

  if (res.error || !res.data) {
    throw new Error(res.error || 'Failed to fetch JWKS');
  }

  if (!Array.isArray(res.data.keys)) {
    throw new Error('Invalid JWKS format: Missing top-level "keys" array conforming to RFC 7517');
  }

  return res.data;
}

/**
 * Find matching key in JWKS by kid and algorithm
 */
export function findMatchingJwk(jwks: JwksData, targetKid?: string, targetAlg?: string): JwkKey | null {
  if (!jwks.keys || jwks.keys.length === 0) return null;

  if (targetKid) {
    const matched = jwks.keys.find((k) => k.kid === targetKid);
    if (matched) return matched;
  }

  // Fallback: If only 1 key exists in JWKS and no targetKid or same alg
  if (jwks.keys.length === 1) {
    return jwks.keys[0];
  }

  // Fallback by algorithm
  if (targetAlg) {
    const matchedByAlg = jwks.keys.find((k) => k.alg === targetAlg);
    if (matchedByAlg) return matchedByAlg;
  }

  return null;
}

/**
 * Verify JWT cryptographic signature against a public JWK using Web Cryptography API
 */
export async function verifyJwtSignatureWithJwk(jwtString: string, jwk: JwkKey): Promise<{ verified: boolean; message?: string }> {
  const parts = jwtString.trim().split('.');
  if (parts.length !== 3) {
    return { verified: false, message: 'Token must have 3 segments (header.payload.signature)' };
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signatureBytes = base64UrlToUint8Array(signatureB64);

  // Decode header to inspect algorithm
  let header: any = {};
  try {
    const rawHeader = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'));
    header = JSON.parse(rawHeader);
  } catch {
    return { verified: false, message: 'Failed to decode JWT header' };
  }

  const alg = header.alg || jwk.alg || 'RS256';

  try {
    if (jwk.kty === 'RSA') {
      let hashName = 'SHA-256';
      if (alg === 'RS384') hashName = 'SHA-384';
      if (alg === 'RS512') hashName = 'SHA-512';

      // Import RSA public key
      const cryptoKey = await crypto.subtle.importKey(
        'jwk',
        {
          kty: 'RSA',
          n: jwk.n,
          e: jwk.e,
          alg: jwk.alg || alg,
          ext: true,
        },
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: { name: hashName },
        },
        false,
        ['verify']
      );

      const isValid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        signatureBytes as BufferSource,
        data as BufferSource
      );

      return {
        verified: isValid,
        message: isValid
          ? `Signature verified cryptographically with RSA public key (${hashName})`
          : 'Signature mismatch: Token was not signed by this RSA public key',
      };
    } else if (jwk.kty === 'EC') {
      let hashName = 'SHA-256';
      let namedCurve = jwk.crv || 'P-256';
      if (alg === 'ES384') {
        hashName = 'SHA-384';
        namedCurve = 'P-384';
      }

      const cryptoKey = await crypto.subtle.importKey(
        'jwk',
        {
          kty: 'EC',
          crv: namedCurve,
          x: jwk.x,
          y: jwk.y,
          ext: true,
        },
        {
          name: 'ECDSA',
          namedCurve,
        },
        false,
        ['verify']
      );

      const isValid = await crypto.subtle.verify(
        {
          name: 'ECDSA',
          hash: { name: hashName },
        },
        cryptoKey,
        signatureBytes as BufferSource,
        data as BufferSource
      );

      return {
        verified: isValid,
        message: isValid
          ? `Signature verified cryptographically with ECDSA ${namedCurve} (${hashName})`
          : 'Signature mismatch: Token was not signed by this ECDSA key',
      };
    } else {
      return {
        verified: false,
        message: `Unsupported JWK key type "${jwk.kty}". Supported: RSA, EC`,
      };
    }
  } catch (err: any) {
    return {
      verified: false,
      message: `Web Crypto verification error: ${err?.message || 'Verification failed'}`,
    };
  }
}

/**
 * Complete verification pipeline:
 * 1. Parse JWT
 * 2. Get JWKS (from discovery, custom URL, or custom JSON)
 * 3. Match kid
 * 4. Verify signature
 */
export async function runJwksVerification(
  jwtString: string,
  options: {
    customJwksUrl?: string;
    customJwksJson?: JwksData;
    customIssuer?: string;
  } = {}
): Promise<JwksValidationResult> {
  const parts = jwtString.trim().split('.');
  if (parts.length < 2) {
    return {
      status: 'error',
      signatureVerified: false,
      message: 'Invalid JWT structure',
    };
  }

  let header: any = {};
  let payload: any = {};
  try {
    const rawHeader = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
    const rawPayload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    header = JSON.parse(rawHeader);
    payload = JSON.parse(rawPayload);
  } catch (e: any) {
    return {
      status: 'error',
      signatureVerified: false,
      message: `Failed to parse JWT JSON: ${e?.message}`,
    };
  }

  const tokenKid = header.kid;
  const tokenAlg = header.alg || 'RS256';
  const issuer = options.customIssuer || payload.iss;

  let jwksData: JwksData | null = options.customJwksJson || null;
  let jwksUri = options.customJwksUrl;
  let discoveryUrl: string | undefined;

  // If not provided as direct JSON, retrieve it
  if (!jwksData) {
    try {
      if (!jwksUri) {
        if (!issuer) {
          return {
            status: 'error',
            signatureVerified: false,
            message: 'No "iss" (Issuer) claim found in JWT payload and no custom JWKS URL provided.',
          };
        }
        const discovery = await discoverJwksUri(issuer);
        jwksUri = discovery.jwksUri;
        discoveryUrl = discovery.discoveryUrl;
      }

      jwksData = await fetchJwks(jwksUri);
    } catch (err: any) {
      return {
        status: 'error',
        signatureVerified: false,
        issuerUrl: issuer,
        discoveryUrl,
        jwksUri,
        message: err?.message || 'Failed to fetch OpenID Configuration or JWKS',
      };
    }
  }

  // Match key
  const totalKeys = jwksData.keys?.length || 0;
  const matchedKey = findMatchingJwk(jwksData, tokenKid, tokenAlg);

  if (!matchedKey) {
    return {
      status: 'key_not_found',
      signatureVerified: false,
      issuerUrl: issuer,
      discoveryUrl,
      jwksUri,
      totalKeysFound: totalKeys,
      matchedKid: tokenKid,
      message: tokenKid
        ? `No matching key ID (kid: "${tokenKid}") found in the ${totalKeys} key(s) returned in JWKS.`
        : `Token header does not specify a "kid", and multiple keys exist in JWKS without match.`,
    };
  }

  // Key found! Now cryptographically verify signature
  const verification = await verifyJwtSignatureWithJwk(jwtString, matchedKey);

  return {
    status: verification.verified ? 'verified' : 'invalid_signature',
    signatureVerified: verification.verified,
    matchedKid: matchedKey.kid || tokenKid || 'unnamed-key',
    matchedKeyType: matchedKey.kty,
    matchedAlg: matchedKey.alg || tokenAlg,
    matchedKeyUse: matchedKey.use || 'sig',
    issuerUrl: issuer,
    discoveryUrl,
    jwksUri,
    totalKeysFound: totalKeys,
    message: verification.message,
  };
}
