export type ToolCategory =
  | 'all'
  | 'base64'
  | 'json'
  | 'jwt'
  | 'jwks'
  | 'hash'
  | 'uri'
  | 'hexdec'
  | 'ip'
  | 'certs'
  | 'k8s'
  | 'oidc';

export interface JwkKey {
  kty: 'RSA' | 'EC' | string;
  kid?: string;
  use?: 'sig' | 'enc' | string;
  alg?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  y?: string;
  [key: string]: any;
}

export interface JwksData {
  keys: JwkKey[];
}

export interface JwksValidationResult {
  status: 'verified' | 'invalid_signature' | 'key_not_found' | 'unsupported_alg' | 'error' | 'idle';
  matchedKid?: string;
  matchedKeyType?: string;
  matchedAlg?: string;
  matchedKeyUse?: string;
  issuerUrl?: string;
  discoveryUrl?: string;
  jwksUri?: string;
  totalKeysFound?: number;
  message?: string;
  signatureVerified: boolean;
}

export interface DetectorResult {
  id: ToolCategory;
  name: string;
  matched: boolean;
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  badge?: string;
  data?: any;
}

export interface NetworkCallLog {
  id: string;
  timestamp: string;
  url: string;
  method: string;
  durationMs: number;
  status: number | string;
  statusText?: string;
  headers?: Record<string, string>;
  details?: string;
  error?: string;
}

export interface PresetPayload {
  name: string;
  category: ToolCategory;
  description: string;
  content: string;
}
