# JWKS Auto-Discovery & Cryptographic Signature Validator

A dedicated, specialized cryptographic verification box for JSON Web Key Sets (JWKS, RFC 7517) that automatically extracts the `iss` (Issuer) from detected JWTs, queries OpenID Connect discovery endpoints (`/.well-known/openid-configuration`), locates the `jwks_uri`, matches the `kid` (Key ID), and performs real in-browser signature verification using the Web Cryptography API (`crypto.subtle`).

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed by the user:
> - **Dedicated Box Placement**: Rendered as an independent, focused tool box positioned directly below the JWT Inspector card whenever a JWT is detected (or when standalone JWKS JSON / URL is supplied).
> - **CORS Resilience & Fallback**: Executes client-side direct fetch against the `iss` discovery URL and `jwks_uri`, with graceful fallback allowing developers to input/paste a custom RFC 7517 compliant JWKS JSON or custom endpoint URL.
> - **Cryptographic Verification Algorithms**: Real cryptographic signature verification using the Web Cryptography API supporting **RSA** (`RS256`, `RS384`, `RS512`) via RSASSA-PKCS1-v1_5 and **ECDSA** (`ES256`, `ES384`) with P-256 / P-384 curves, identifying key type (`kty`), key usage (`use`), and exact matching `kid`.

---

### 1. Overview & Core Concept

When a user pastes a JWT into the AllTheThings input:
1. **Issuer Detection**: The JWT analyzer extracts the `iss` claim (e.g. `https://accounts.google.com`, `https://dev-xyz.us.auth0.com`, or any OIDC provider).
2. **OpenID Configuration Lookup**: Constructs the standard discovery URL: `${iss}/.well-known/openid-configuration` (RFC 8414 / OIDC Core 1.0).
3. **JWKS URI Extraction**: Fetches the discovery JSON, retrieves `jwks_uri` (e.g. `https://www.googleapis.com/oauth2/v3/certs`), and loads the public keys array (`keys: [...]`). Every external fetch increments the **Network Calls Counter** and logs to the network drawer.
4. **Key Matching & Inspection**: Compares the token's header `kid` with the keys in the JWKS. Displays:
   - Matched `kid` (Key ID)
   - Key Type (`kty`: `RSA` or `EC`)
   - Algorithm (`alg`: `RS256`, `ES256`, etc.)
   - Intended Use (`use`: `sig`)
   - Public Key Modulus / Coordinates (`n`, `e`, `x`, `y`)
5. **Real Cryptographic Verification**: Converts the matching JWK into a `CryptoKey` via `crypto.subtle.importKey('jwk', ...)` and verifies the token's signature against `${header}.${payload}` using `crypto.subtle.verify(...)`.
6. **Custom RFC 7517 JWKS URL / JSON Input**: Developers can override the discovery process by providing any custom RFC 7517 compliant JWKS URL or directly pasting a raw JWKS JSON object.

---

### 2. User Experience & Visual Design

#### Key User Flows
- **Automatic Discovery Flow**:
  - Developer pastes a JWT with an `iss` (e.g. Google, Auth0, Okta, Keycloak).
  - The JWT box renders on top; immediately below it, the **JWKS Validator** box appears.
  - An "Auto-Discover & Verify" button shows the resolved discovery URL. Clicking it queries the OIDC configuration, retrieves keys, and verifies the signature in real time.
- **Verification Status Indicators**:
  - `Signature Verified`: High-contrast emerald badge (`✓ Valid signature verified against kid: "..." (RSA 2048-bit)`).
  - `Key Matched, Invalid Signature`: Rose badge (`✗ Signature does not match public key in JWKS`).
  - `No Matching Key ID`: Amber badge (`⚠ Token kid: "..." not found in the 3 keys returned by provider`).
- **Custom JWKS Mode**:
  - A toggle to switch between `OIDC Auto-Discovery (iss claim)` and `Custom JWKS URL / Raw JSON (RFC 7517)`.
  - Input field with RFC 7517 format compliance helper.

#### Visual Styling
- Adheres to the Dark Engineering Terminal theme (`#111827` surface, `#1E293B` borders, `#0B0F17` inputs).
- Accented with bright violet and emerald status indicators for cryptographic key attributes.

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Pure Client-Side `crypto.subtle` vs External Verification
- **Chosen Approach**: Imports the JWK (`kty: RSA` or `EC`) directly into the browser's native Web Cryptography API (`crypto.subtle.importKey('jwk', ...)`).
- **Why**: Zero latency, total confidentiality (the token and keys never leave the browser sandbox), and full offline capability when JWKS JSON is pasted locally.

#### Decision 2: CORS Transparency & Gated Network Tracking
- **Chosen Approach**: All external network calls (fetching `.well-known/openid-configuration` and `jwks_uri`) are routed through `networkTracker`, displaying response time, HTTP status, and error details in the bottom status bar and network drawer. If browser CORS blocks the fetch, the UI displays a clear explanation and immediately opens the manual JWKS JSON paste input.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        JWT Detected in Input                           │
│   (Header: alg="RS256", kid="key-123" | Payload: iss="https://...")   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Dedicated JWKS Box (Auto-Discovery Engine)                │
│                                                                        │
│  [ Step 1: Query /.well-known/openid-configuration ]                   │
│         │                                                              │
│         ▼                                                              │
│  [ Step 2: Retrieve jwks_uri ] ─── (Increments Network Counter)        │
│         │                                                              │
│         ▼                                                              │
│  [ Step 3: Parse RFC 7517 JWKS Keys (keys: [ { kid, kty, alg, ... } ])]│
│         │                                                              │
│         ▼                                                              │
│  [ Step 4: Find Matching Key ID ("key-123") ]                          │
│         │                                                              │
│         ├── Found ──> [ Step 5: crypto.subtle.importKey('jwk') ]       │
│         │                    │                                         │
│         │                    ▼                                         │
│         │             [ Step 6: crypto.subtle.verify(...) ]            │
│         │                    │                                         │
│         │                    ├── Valid ──> [ ✓ Signature Valid ]       │
│         │                    └── Invalid ─> [ ✗ Signature Mismatch ]   │
│         │                                                              │
│         └── Not Found ──> [ ⚠ kid not present in provider JWKS ]       │
└────────────────────────────────────────────────────────────────────────┘
```

#### New Modules:
- `src/utils/jwksEngine.ts`:
  - `discoverJwksUri(issuer: string)`: fetches `.well-known/openid-configuration`
  - `fetchJwks(jwksUri: string)`: retrieves and parses RFC 7517 keys
  - `verifyJwtSignatureWithJwk(token: string, jwk: any)`: uses `crypto.subtle` for RSA and ECDSA signature verification
  - `parseJwkKeyDetails(jwk: any)`: extracts algorithm, curve, bit-length, modulus/exponent, coordinates
- `src/components/detectors/JwksBox.tsx`:
  - Dedicated interactive box with discovery controls, matched kid inspector, public key viewer, and signature validation report
- Integration in `src/App.tsx`, `src/types/index.ts`, and `tests/engines.test.ts`.
