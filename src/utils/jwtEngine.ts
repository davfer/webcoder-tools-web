export interface JwtClaimInfo {
  name: string;
  value: any;
  description: string;
  humanValue?: string;
  isExpired?: boolean;
}

export interface JwtAnalysis {
  isJwt: boolean;
  header: any;
  payload: any;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  algorithm: string;
  type: string;
  keyId?: string;
  claims: JwtClaimInfo[];
  expirationStatus: 'valid' | 'expired' | 'no-exp';
  timeRemaining?: string;
  issuedAtAgo?: string;
  formattedHeader: string;
  formattedPayload: string;
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }
  return decodeURIComponent(
    atob(output)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function analyzeJwt(input: string): JwtAnalysis {
  const trimmed = input.trim();
  const parts = trimmed.split('.');

  if (parts.length < 2 || parts.length > 3) {
    return {
      isJwt: false,
      header: null,
      payload: null,
      signature: '',
      rawHeader: '',
      rawPayload: '',
      algorithm: '',
      type: '',
      claims: [],
      expirationStatus: 'no-exp',
      formattedHeader: '',
      formattedPayload: '',
    };
  }

  try {
    const rawHeader = base64UrlDecode(parts[0]);
    const rawPayload = base64UrlDecode(parts[1]);

    const header = JSON.parse(rawHeader);
    const payload = JSON.parse(rawPayload);
    const signature = parts[2] || '';

    const now = Math.floor(Date.now() / 1000);
    const claims: JwtClaimInfo[] = [];

    let expirationStatus: 'valid' | 'expired' | 'no-exp' = 'no-exp';
    let timeRemaining: string | undefined;
    let issuedAtAgo: string | undefined;

    if (payload.exp !== undefined) {
      const exp = Number(payload.exp);
      const isExpired = exp < now;
      expirationStatus = isExpired ? 'expired' : 'valid';

      const diffSec = Math.abs(exp - now);
      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;

      const timeStr = `${hours > 0 ? hours + 'h ' : ''}${mins}m ${secs}s`;
      timeRemaining = isExpired ? `Expired ${timeStr} ago` : `Expires in ${timeStr}`;

      claims.push({
        name: 'exp',
        value: payload.exp,
        description: 'Expiration Time',
        humanValue: new Date(exp * 1000).toLocaleString() + ` (${timeRemaining})`,
        isExpired,
      });
    }

    if (payload.iat !== undefined) {
      const iat = Number(payload.iat);
      const diffSec = Math.max(0, now - iat);
      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      issuedAtAgo = `${hours > 0 ? hours + 'h ' : ''}${mins}m ago`;

      claims.push({
        name: 'iat',
        value: payload.iat,
        description: 'Issued At',
        humanValue: new Date(iat * 1000).toLocaleString() + ` (${issuedAtAgo})`,
      });
    }

    if (payload.nbf !== undefined) {
      const nbf = Number(payload.nbf);
      claims.push({
        name: 'nbf',
        value: payload.nbf,
        description: 'Not Before',
        humanValue: new Date(nbf * 1000).toLocaleString(),
      });
    }

    const standardClaimDesc: Record<string, string> = {
      iss: 'Issuer',
      sub: 'Subject',
      aud: 'Audience',
      jti: 'JWT ID',
      name: 'User Full Name',
      email: 'Email Address',
      roles: 'User Roles',
      scope: 'OAuth Scopes',
    };

    for (const [key, desc] of Object.entries(standardClaimDesc)) {
      if (payload[key] !== undefined) {
        claims.push({
          name: key,
          value: payload[key],
          description: desc,
          humanValue: typeof payload[key] === 'object' ? JSON.stringify(payload[key]) : String(payload[key]),
        });
      }
    }

    return {
      isJwt: true,
      header,
      payload,
      signature,
      rawHeader,
      rawPayload,
      algorithm: header.alg || 'none',
      type: header.typ || 'JWT',
      keyId: header.kid,
      claims,
      expirationStatus,
      timeRemaining,
      issuedAtAgo,
      formattedHeader: JSON.stringify(header, null, 2),
      formattedPayload: JSON.stringify(payload, null, 2),
    };
  } catch {
    return {
      isJwt: false,
      header: null,
      payload: null,
      signature: '',
      rawHeader: '',
      rawPayload: '',
      algorithm: '',
      type: '',
      claims: [],
      expirationStatus: 'no-exp',
      formattedHeader: '',
      formattedPayload: '',
    };
  }
}
