import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { analyzeBase64, encodeBase64 } from '../src/utils/base64Engine.ts';
import { analyzeJson, queryJsonPath } from '../src/utils/jsonEngine.ts';
import { analyzeJwt } from '../src/utils/jwtEngine.ts';
import { calculateCRC32, calculateMD5, detectHashType, evaluatePassword } from '../src/utils/hashEngine.ts';
import { analyzeUri } from '../src/utils/uriEngine.ts';
import { analyzeHexDec } from '../src/utils/hexDecEngine.ts';
import { analyzeIp } from '../src/utils/ipEngine.ts';
import { analyzeK8s } from '../src/utils/k8sEngine.ts';
import { generatePkcePair, buildAuthorizeUrl } from '../src/utils/oidcEngine.ts';
import { findMatchingJwk, normalizeIssuer, verifyJwtSignatureWithJwk } from '../src/utils/jwksEngine.ts';

describe('Base64 Engine', () => {
  test('encodes and decodes standard Base64', () => {
    const raw = 'Hello World!';
    const encoded = encodeBase64(raw);
    assert.equal(encoded, 'SGVsbG8gV29ybGQh');

    const analysis = analyzeBase64(encoded);
    assert.equal(analysis.isBase64, true);
    assert.equal(analysis.decodedText, raw);
    assert.equal(analysis.isPrintable, true);
  });

  test('encodes and decodes URL-safe Base64', () => {
    const raw = 'Test payload with symbols ~+/?';
    const urlSafe = encodeBase64(raw, true);
    assert.ok(!urlSafe.includes('+'));
    assert.ok(!urlSafe.includes('/'));

    const analysis = analyzeBase64(urlSafe);
    assert.equal(analysis.isBase64, true);
    assert.equal(analysis.decodedText, raw);
  });
});

describe('JSON Engine', () => {
  test('validates and formats JSON', () => {
    const jsonStr = '{"name":"webcoder","online":true,"count":42}';
    const analysis = analyzeJson(jsonStr);

    assert.equal(analysis.isValidJson, true);
    assert.equal(analysis.stats.keysCount, 3);
    assert.equal(analysis.stats.type, 'object');
    assert.ok(analysis.formatted.includes('\n'));
  });

  test('evaluates dot-notation query paths', () => {
    const data = { app: { version: '1.0.0', metrics: { latency: 15 } } };
    const res1 = queryJsonPath(data, 'app.version');
    assert.equal(res1.result, '1.0.0');

    const res2 = queryJsonPath(data, 'app.metrics.latency');
    assert.equal(res2.result, 15);
  });
});

describe('JWT Engine', () => {
  test('parses JWT header and payload claims', () => {
    // Standard test JWT
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTl9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
    const analysis = analyzeJwt(token);

    assert.equal(analysis.isJwt, true);
    assert.equal(analysis.algorithm, 'HS256');
    assert.equal(analysis.payload.sub, '1234567890');
    assert.equal(analysis.payload.name, 'John Doe');
    assert.equal(analysis.expirationStatus, 'valid');
  });
});

describe('Hash Engine', () => {
  test('calculates accurate CRC32 and MD5 digests', () => {
    const input = 'hello';
    const crc = calculateCRC32(input);
    assert.equal(crc.toLowerCase(), '3610a686');

    const md5 = calculateMD5(input);
    assert.equal(md5.toLowerCase(), '5d41402abc4b2a76b9719d911017c592');
  });

  test('detects hash types', () => {
    const md5Hash = '5d41402abc4b2a76b9719d911017c592';
    const det = detectHashType(md5Hash);
    assert.equal(det.isLikelyHash, true);
    assert.ok(det.algorithm.includes('MD5'));

    const bcryptHash = '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
    const detBcrypt = detectHashType(bcryptHash);
    assert.equal(detBcrypt.algorithm, 'bcrypt');
  });

  test('evaluates password entropy', () => {
    const pass = 'Correct-Horse-Battery-Staple-2026!';
    const score = evaluatePassword(pass);
    assert.ok(score.entropyBits > 60);
    assert.equal(score.hasLower, true);
    assert.equal(score.hasUpper, true);
    assert.equal(score.hasNumber, true);
    assert.equal(score.hasSymbol, true);
  });
});

describe('URI Engine', () => {
  test('dissects URI components and query string parameters', () => {
    const url = 'https://api.webcoder.tools:8443/v1/network/inspect?target=example.com&probe=cors%2Chsts#telemetry';
    const analysis = analyzeUri(url);

    assert.equal(analysis.isUri, true);
    assert.equal(analysis.protocol, 'https:');
    assert.equal(analysis.hostname, 'api.webcoder.tools');
    assert.equal(analysis.port, '8443');
    assert.equal(analysis.pathname, '/v1/network/inspect');
    assert.equal(analysis.hasQuery, true);
    assert.equal(analysis.queryParams.length, 2);
    assert.equal(analysis.queryParams[0].key, 'target');
    assert.equal(analysis.queryParams[0].value, 'example.com');
    assert.equal(analysis.hash, 'telemetry');
  });
});

describe('Hex/Dec Engine', () => {
  test('converts hex strings to decimal and binary', () => {
    const hex = '0xFF';
    const analysis = analyzeHexDec(hex);

    assert.equal(analysis.isConvertible, true);
    assert.equal(analysis.detectedType, 'hex');
    assert.equal(analysis.decimal, '255');
    assert.equal(analysis.hex, 'FF');
  });
});

describe('IP & CIDR Engine', () => {
  test('calculates IPv4 subnet parameters', () => {
    const cidr = '192.168.1.0/24';
    const analysis = analyzeIp(cidr);

    assert.equal(analysis.isIp, true);
    assert.equal(analysis.version, 4);
    assert.equal(analysis.netmask, '255.255.255.0');
    assert.equal(analysis.networkAddress, '192.168.1.0');
    assert.equal(analysis.broadcastAddress, '192.168.1.255');
    assert.equal(analysis.firstUsableIp, '192.168.1.1');
    assert.equal(analysis.lastUsableIp, '192.168.1.254');
    assert.equal(analysis.usableHosts, 254);
    assert.equal(analysis.ipType, 'Private (RFC 1918)');
  });
});

describe('Kubernetes Engine', () => {
  test('parses Secret manifest and reveals base64 encoded data', () => {
    const manifest = `apiVersion: v1
kind: Secret
metadata:
  name: test-secret
  namespace: default
type: Opaque
data:
  API_KEY: c2VjcmV0LWtleS0xMjM=`;

    const analysis = analyzeK8s(manifest);
    assert.equal(analysis.isK8s, true);
    assert.equal(analysis.resources.length, 1);
    assert.equal(analysis.resources[0].isSecret, true);
    assert.equal(analysis.resources[0].secretEntries?.[0].key, 'API_KEY');
    assert.equal(analysis.resources[0].secretEntries?.[0].decodedValue, 'secret-key-123');
  });
});

describe('OAuth & OIDC Engine', () => {
  test('generates cryptographically valid PKCE code_challenge S256', async () => {
    const pair = await generatePkcePair(64);
    assert.equal(pair.method, 'S256');
    assert.equal(pair.verifier.length, 64);
    assert.ok(pair.challenge.length > 20);

    const authUrl = buildAuthorizeUrl({
      authEndpoint: 'https://auth.example.com/oauth2/v1/authorize',
      clientId: 'my-client',
      redirectUri: 'http://localhost:3000/callback',
      scope: 'openid profile',
      codeChallenge: pair.challenge,
    });

    assert.ok(authUrl.includes('code_challenge='));
    assert.ok(authUrl.includes('code_challenge_method=S256'));
    assert.ok(authUrl.includes('client_id=my-client'));
  });
});

describe('JWKS Engine & Cryptographic Signature Verification', () => {
  test('matches kid and identifies key attributes from RFC 7517 JWKS', () => {
    assert.equal(normalizeIssuer('accounts.google.com/'), 'https://accounts.google.com');

    const sampleJwks = {
      keys: [
        { kty: 'RSA', kid: 'key-1', use: 'sig', alg: 'RS256', n: 'abc', e: 'AQAB' },
        { kty: 'EC', kid: 'key-2', use: 'sig', alg: 'ES256', crv: 'P-256', x: '123', y: '456' },
      ],
    };

    const matched = findMatchingJwk(sampleJwks, 'key-2');
    assert.ok(matched);
    assert.equal(matched.kid, 'key-2');
    assert.equal(matched.kty, 'EC');
    assert.equal(matched.alg, 'ES256');

    const missing = findMatchingJwk(sampleJwks, 'key-non-existent');
    assert.equal(missing, null);
  });

  test('cryptographically verifies valid RSA signature and rejects tampered tokens', async () => {
    // Generate real RSA key pair
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify']
    );

    const publicJwk: any = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    publicJwk.kid = 'test-kid-2026';
    publicJwk.alg = 'RS256';

    const header = { alg: 'RS256', typ: 'JWT', kid: 'test-kid-2026' };
    const payload = { sub: 'user_123', iss: 'https://auth.webcoder.tools', exp: 1999999999 };

    const b64Url = (obj: any) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const headerB64 = b64Url(header);
    const payloadB64 = b64Url(payload);
    const dataToSign = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

    const signatureBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keyPair.privateKey, dataToSign);
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuf)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const validJwt = `${headerB64}.${payloadB64}.${sigB64}`;

    // Test valid verification
    const resValid = await verifyJwtSignatureWithJwk(validJwt, publicJwk as any);
    assert.equal(resValid.verified, true);
    assert.ok(resValid.message?.includes('Signature verified'));

    // Test tampered payload
    const tamperedPayloadB64 = b64Url({ ...payload, sub: 'attacker' });
    const tamperedJwt = `${headerB64}.${tamperedPayloadB64}.${sigB64}`;
    const resTampered = await verifyJwtSignatureWithJwk(tamperedJwt, publicJwk as any);
    assert.equal(resTampered.verified, false);
    assert.ok(resTampered.message?.includes('Signature mismatch'));
  });
});

describe('Detector Registry Machine (T -> []Boxes)', () => {
  test('returns empty array when input is blank', async () => {
    const { defaultDetectorRegistry } = await import('../src/services/detectorRegistry.tsx');
    const boxes = defaultDetectorRegistry.evaluate('');
    assert.equal(boxes.length, 0);

    const whitespaceBoxes = defaultDetectorRegistry.evaluate('   \n  ');
    assert.equal(whitespaceBoxes.length, 0);
  });

  test('prioritizes IP box on top and hashes at bottom for IP input', async () => {
    const { defaultDetectorRegistry } = await import('../src/services/detectorRegistry.tsx');
    const input = '192.168.1.1';
    const boxes = defaultDetectorRegistry.evaluate(input);

    assert.ok(boxes.length >= 2, 'Should match multiple tools including IP and Hash');
    // Top box must be IP
    assert.equal(boxes[0].id, 'ip', 'First box must be IP');
    assert.equal(boxes[0].score, 100);

    // Hash detector should be present but sorted near the bottom
    const ipIndex = boxes.findIndex((b) => b.id === 'ip');
    const hashIndex = boxes.findIndex((b) => b.id === 'hash');
    assert.ok(ipIndex < hashIndex, 'IP box must precede generic Hash box');
    assert.ok(boxes[ipIndex].effectiveRank > boxes[hashIndex].effectiveRank, 'IP effective rank must beat Hash');
  });

  test('prioritizes JWT and JWKS boxes over generic transform boxes', async () => {
    const { defaultDetectorRegistry } = await import('../src/services/detectorRegistry.tsx');
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT', kid: 'key-1' })).replace(/=/g, '');
    const payload = btoa(JSON.stringify({ sub: '123', iss: 'https://example.com' })).replace(/=/g, '');
    const testJwt = `${header}.${payload}.fake_signature`;

    const boxes = defaultDetectorRegistry.evaluate(testJwt);
    assert.ok(boxes.length >= 2);
    assert.equal(boxes[0].id, 'jwt', 'Top box for JWT token must be JWT');

    const jwtIndex = boxes.findIndex((b) => b.id === 'jwt');
    const hashIndex = boxes.findIndex((b) => b.id === 'hash');
    assert.ok(jwtIndex < hashIndex, 'JWT box must precede Hash box');
  });
});

