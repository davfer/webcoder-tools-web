import { PresetPayload } from '../types';

export const SAMPLE_PRESETS: PresetPayload[] = [
  {
    name: 'JWT with OIDC Discovery',
    category: 'jwks',
    description: 'OpenID Connect ID token with iss: https://accounts.google.com and kid',
    content:
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjY3ZTE4ZDM1OWU2ZmE2NjJhMDhkMzY2ODcwNzgxZWY0YzNmNjJhY2EifQ.eyJpc3MiOiJodHRwczovL2F1dGgud2ViY29kZXIudG9vbHMiLCJzdWIiOiIxMDk5NDgyODEwOTQ4OTI4MSIsImF1ZCI6IndlYmNvZGVyLXRlc3QtYXBwIiwiZXhwIjoxOTk5OTk5OTk5LCJpYXQiOjE3NjA0ODAwMDAsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfQ.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
  },
  {
    name: 'JWT Auth Token',
    category: 'jwt',
    description: 'RS256 Bearer Token with user scopes and timestamps',
    content:
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImF1dGgtMjAyNi0xMCJ9.eyJpc3MiOiJodHRwczovL2F1dGgud2ViY29kZXIudG9vbHMiLCJzdWIiOiJ1c3JfMDk4MmZhNzc2YjE5IiwiYXVkIjpbIndlYmNvZGVyLWFwaSIsImRldmVsb3Blci1jb25zb2xlIl0sImV4cCI6MTgwMDAwMDAwMCwiaWF0IjoxNzYwNDgwMDAwLCJuYW1lIjoiQWxleCBDb2RlciIsImVtYWlsIjoiYWxleEB3ZWJjb2Rlci50b29scyIsInJvbGVzIjpbInNlY3VyaXR5LWVuZ2luZWVyIiwiYWRtaW4iXSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBhcGk6cmVhZCBhcGk6d3JpdGUifQ.mock_signature_X9j4k2L0q1vNm8P5wT3rYbC7eA1dF',
  },
  {
    name: 'URI with Query String',
    category: 'uri',
    description: 'API endpoint with rich query parameters, protocol, and port',
    content:
      'https://api.webcoder.tools:8443/v1/network/inspect?target=example.com&probe=cors%2Chsts&timeout=5000&verbose=true&auth_mode=bearer#telemetry-section',
  },
  {
    name: 'K8s Secret Manifest',
    category: 'k8s',
    description: 'Kubernetes Secret with base64 encoded database credentials',
    content: `apiVersion: v1
kind: Secret
metadata:
  name: postgres-cluster-creds
  namespace: production
type: Opaque
data:
  DB_HOST: cG9zdGdyZXMtcHJvZC5pbnRlcm5hbA==
  DB_PORT: NTQzMg==
  DB_NAME: Y29kZXJfdG9vbHNfZGI=
  DB_USERNAME: YWRtaW5fdXNlcg==
  DB_PASSWORD: U3VwZXJTZWNyZXRQYXNzdzByZCEyMDI2`,
  },
  {
    name: 'X.509 Certificate (PEM)',
    category: 'certs',
    description: 'TLS server certificate in PEM format',
    content: `-----BEGIN CERTIFICATE-----
MIIEkjCCA3qgAwIBAgIQBNjGqP/6K6p4p8l2h3P9RjANBgkqhkiG9w0BAQsFADBh
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD
QTAeFw0yMjA2MDgwMDAwMDBaFw0zMjA2MDcyMzU5NTlaMGExCzAJBgNVBAYTAlVT
MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j
b20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1kYn...truncated...
-----END CERTIFICATE-----`,
  },
  {
    name: 'Base64 JSON Payload',
    category: 'base64',
    description: 'Base64 string containing serialized client configuration',
    content:
      'eyJlbnZpcm9ubWVudCI6InN0YWdpbmciLCJkZWJ1ZyI6dHJ1ZSwiY2xpZW50X2lkIjoiY2xpZW50LTk4MjEiLCJyYXRlX2xpbWl0Ijp7IndpbmRvd19zZWMiOjYwLCJtYXhfcmVxdWVzdHMiOjEwMDB9LCJmZWF0dXJlcyI6WyJvaWRjIiwicGt2ZSIsImRvaF9yZXNvbHZlciJdfQ==',
  },
  {
    name: 'Password & Bcrypt Hash',
    category: 'hash',
    description: 'Bcrypt hashed password signature',
    content: '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW',
  },
  {
    name: 'JSON API Response',
    category: 'json',
    description: 'Structured JSON response object with metrics and headers',
    content: `{
  "status": "healthy",
  "version": "1.0.0",
  "region": "us-east-1",
  "services": {
    "auth": { "online": true, "latency_ms": 12 },
    "doh_dns": { "online": true, "latency_ms": 24 },
    "vault": { "online": true, "latency_ms": 8 }
  },
  "tags": ["production", "pwa", "offline-capable"]
}`,
  },
  {
    name: 'IPv4 CIDR Subnet',
    category: 'ip',
    description: 'Subnet block for network calculation',
    content: '192.168.10.0/24',
  },
  {
    name: 'Hex Byte String',
    category: 'hexdec',
    description: 'Hexadecimal raw byte array',
    content: '0x48656C6C6F20576F726C642120576562436F64657220546F6F6C73',
  },
];
