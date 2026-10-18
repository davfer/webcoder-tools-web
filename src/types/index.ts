export type ToolCategory =
  | 'all'
  | 'base64'
  | 'json'
  | 'jwt'
  | 'hash'
  | 'uri'
  | 'hexdec'
  | 'ip'
  | 'certs'
  | 'k8s'
  | 'oidc';

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
