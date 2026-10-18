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
