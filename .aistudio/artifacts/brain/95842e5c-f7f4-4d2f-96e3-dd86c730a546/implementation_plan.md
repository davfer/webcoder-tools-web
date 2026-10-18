# WebCoder Tools (webcoder.tools) — AllTheThings Developer Workbench

A high-density developer utility and security workbench engineered for instant offline computation, intelligent multi-format payload detection, and deep inspection of Web, Identity, Cloud, and Network primitives.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during Phase 1:
> - **Framework & Ecosystem**: Built with React 19, TypeScript, Vite, and Tailwind CSS for rapid client-side computation and zero-latency UI reactivity.
> - **Live Network & URI Diagnostics**: Runs pure client-side inspection (browser fetch, Web Performance Timing APIs, and DNS-over-HTTPS via Cloudflare/Google public DoH) with an explicit **Network Calls Counter** and audit log tracking every outbound network attempt.
> - **Visual Theme & Density**: Dark engineering terminal theme (`#0B0F17` dark slate canvas, `#111827` elevated surfaces, `#1E293B` hairline borders, and cyan/emerald monospace accents) with compact tabular alignment.

---

### 1. Overview & Core Concept

**WebCoder Tools** is an all-in-one developer console centered around the **AllTheThings Mode**:
1. **Universal Input**: A full-width, multi-line command/payload input textarea where developers paste arbitrary raw data (JWTs, Base64 strings, JSON, X.509 PEM certificates, Kubernetes YAML manifests, URLs, IP addresses, or password hashes).
2. **Auto-Detection Engine**: Continuously parses the input across 11 specialized format engines without requiring manual mode switching.
3. **Interactive Detection Boxes**: Each recognized format renders an interactive, actionable preview card below the textarea. Any card can be expanded into **Focus Mode** for comprehensive debugging, manipulation, and round-trip conversion.
4. **Offline-First & PWA**: Fully functional offline with zero network leaks for sensitive keys/hashes. Outbound requests are opt-in, gated, and tracked on a visible Network Counter.

---

### 2. User Experience & Visual Design

#### Key User Flows
- **Zero-State**: On initial load, developers see the top bar, left function sidebar with detector toggles, the primary AllTheThings textarea with quick-fill sample presets (JWT, K8s Secret, URL with query params, X.509 cert, JSON payload), and quick-start tips.
- **Typing & Paste Detection**: As text is entered or pasted, active detectors trigger in real-time (<50ms debounced), highlighting matching formats and rendering structured inspector cards.
- **Focus / Deep Dive Mode**: Clicking "Focus" on any card (e.g., *URI Mode* or *JWT/JWKS*) isolates that tool into a full-height specialized workspace with granular controls (e.g., query param editor, live HTTP/CORS/timings pinger, PKCE generator, K8s secret base64 decoder).
- **Network Gating & Activity Drawer**: Outbound network requests (such as URI ping, TLS inspection, or DoH reverse lookup) explicitly warn the user and increment the persistent bottom status counter. Clicking the counter opens a slide-over audit log.
- **PWA Installation**: Prominent install button in the top action zone supporting desktop Chrome/Edge install prompts and guided step-by-step iOS Safari home-screen instructions.

#### Visual Identity & Theme
- **Theme Canvas**: Dark engineering terminal (Neutral canvas `#0B0F17`, surfaces `#111827` and `#161F30`, borders `rgba(255,255,255,0.08)`).
- **Typography**: Display & structural headers in `Plus Jakarta Sans` / `Inter`, telemetry & code in `JetBrains Mono` / `font-mono` with `tabular-nums`.
- **Top Bar Contract**:
  - *Zone 1 (Brand)*: `WebCoder Tools` wordmark in crisp sans bold with a subtle cyan terminal prompt glyph.
  - *Zone 2 (Navigation / Modes)*: Clean text links for `AllTheThings`, `URI & Network`, `Identity & OIDC`, `Crypto & Hashes`, `K8s & Cloud`.
  - *Zone 3 (Actions)*: In-app PWA Install button, Sample Presets selector, and Mock Dev Identity toggle (`Local Developer`).
- **Footer Status Bar**:
  - Live Network Calls Counter with clear indicator badge (`0 External Calls` / `N Active Calls`).
  - App version (`v1.0.0-pwa`).
  - GitHub repository link.
  - Settings drawer trigger (auto-detect toggles, local storage purge, network permissions).

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Client-Side Computation vs. Server Delegation
- **Chosen Approach**: All 11 format parsers (Base64, JSON, JWT/JWKS, Hashes/Passwords, CRC/MD5/SHA1, URI dissection, Hex/Dec/Bin, IP/CIDR, X.509 certs, K8s YAML/Secrets, OAuth PKCE/State) run 100% in-browser via native Web APIs (SubtleCrypto, TextEncoder, URL, BigInt).
- **Why**: Zero latency, total data privacy (credentials and internal tokens never leave the developer's machine), and full offline capability as a PWA.
- **Network Gating**: External calls (URI ping, CORS check, DoH) are triggered strictly by user action and increment the Network Calls Counter.

#### Decision 2: Detection Priority & Multi-Box Layout
- **Chosen Approach**: Multi-match detection pipeline. An input can match multiple formats (e.g., a Base64 string that decodes to a valid JSON or JWT). The UI renders stacked interactive cards ordered by specificity, with URI query strings placed prominently at the top when URLs are detected.
- **Why**: Eliminates manual mode switching and prevents false-negative dead ends.

#### Decision 3: Deep Feature Scope
- **JWT & OIDC**: Decodes Header/Payload/Signature, computes expiration status and relative countdowns, validates claims, provides PKCE code verifier/challenge S256 calculator and OAuth token response tester.
- **URI Mode**: Dissects scheme, auth, host, port, path, and places the query parameters table on top with live key-value manipulation. Provides CORS check, browser timing breakdown, IP/DoH resolver, and visual traceroute hop simulation.
- **Kubernetes Resources**: Formats YAML/JSON, highlights Kind and APIVersion, and automatically parses `data` fields in Secrets with 1-click base64 reveal.
- **X.509 Certificates**: Parses PEM format, extracting Subject, Issuer, Validity window, Serial, and fingerprints.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│   [WebCoder Tools] ── [AllTheThings | URI | OIDC | Hashes] ── [Install]│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────┬───────────────┴────────────────────────────────────┐
│   Left Sidebar    │                 Primary Workspace                  │
│                   │ ┌────────────────────────────────────────────────┐ │
│ ┌───────────────┐ │ │            AllTheThings Textarea               │ │
│ │ Mode Focus:   │ │ │ (Paste any token, JSON, URL, YAML, Hash, cert) │ │
│ │ • AllTheThings│ │ └────────────────────────┬───────────────────────┘ │
│ │ • URI Tools   │ │                          │                         │
│ │ • OIDC Test   │ │                          ▼                         │
│ │ • Crypto      │ │              Auto-Detection Pipeline               │
│ │ • K8s / Cloud │ │  (Regex + Grammars + SubtleCrypto + Decoders)      │
│ ├───────────────┤ │                          │                         │
│ │ Active Checks:│ │       ┌──────────────────┴──────────────────┐      │
│ │ [✓] Base64    │ │       ▼                                     ▼      │
│ │ [✓] JSON      │ │ ┌───────────────────┐             ┌──────────────┐ │
│ │ [✓] JWT/JWKS  │ │ │ URI Query & Ping  │             │ JWT / JWKS   │ │
│ │ [✓] Hashes    │ │ ├───────────────────┤             ├──────────────┤ │
│ │ [✓] IP/CIDR   │ │ │ Params table top  │             │ Claims, Exp, │ │
│ │ [✓] X.509 Cert│ │ │ Timings, CORS     │             │ Algorithms   │ │
│ │ [✓] K8s YAML  │ │ └───────────────────┘             └──────────────┘ │
│ └───────────────┘ │       ┌──────────────────┬──────────────────┐      │
│                   │       ▼                  ▼                  ▼      │
│                   │ ┌───────────┐      ┌───────────┐      ┌──────────┐ │
│                   │ │ K8s YAML  │      │ Base64/Hex│      │ Hash/MD5 │ │
│                   │ └───────────┘      └───────────┘      └──────────┘ │
└───────────────────┴────────────────────────────────────────────────────┘
│ Footer: [v1.0.0] · [GitHub] · [🌐 Network Calls: 3 (Audit Log)] · [⚙ Settings] │
└────────────────────────────────────────────────────────────────────────┘
```

#### State & Storage
- `inputText`: String state synchronized with local persistence (`localStorage`) so developers don't lose work on reload.
- `activeFilter`: String (`"all"` or isolated tool ID for single-concept focus).
- `networkAuditLog`: Array of `{ id, timestamp, url, method, durationMs, status, error }` displayed in the Network Drawer.
- `pwaInstallState`: Standardized `usePWAInstall` hook handling `beforeinstallprompt`, iOS guidance modal, and standalone mode detection.
