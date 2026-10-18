# Implementation Plan: Extensible Detector Registry Architecture (`T -> []Boxes`)

Refactor the detector system into a dedicated, modular detector registry machine that implements a clean `T -> []Boxes` pipeline. Registered detectors evaluate the input string `T`, produce a normalized match confidence score (0-100) and specificity rank, and emit a sorted list of matched boxes `[]Boxes` where specialized detectors (like IP, JWT, X.509, K8s, JSON, URI) appear at the top and generic fallback tools (like Hash/CRC) remain visible at the bottom.

## User Review Required

> [!IMPORTANT]
> **Priority and Tie-Breaking Strategy**
> Each detector will have:
> 1. `matchScore`: 0–100 calculated confidence for the specific input.
> 2. `specificity`: Categorical priority tier (`HIGH` = 100 for domain-specific payloads like IP, JWT, X.509, K8s; `MEDIUM` = 50 for formatted representations like JSON, URI, HexDec, Base64; `GENERIC` = 10 for universal hashing/CRC tools).
> 3. Sorting function: Primary sort by combined effective score `(matchScore * 1000 + specificity)`, ensuring IP address matches always beat generic hash/CRC boxes while keeping hash/CRC visible at the bottom.

## Proposed Changes

### 1. Detector Registry Core Engine (`src/services/detectorRegistry.ts`)
Create a dedicated registry module defining the type contracts, detector registration, and execution pipeline:
- **`DetectorContext<T>`**: Contains raw input, trimmed input, and any shared utilities.
- **`DetectorResult<TData>`**: Contains `matched: boolean`, `score: number` (0–100), `specificity: SpecificityTier`, `data: TData`, and metadata.
- **`RegisteredDetector<T, TResult>`**:
  - `id`: Unique identifier (`ip`, `jwt`, `jwks`, `json`, `k8s`, `certs`, `uri`, `hexdec`, `base64`, `hash`, `oidc`).
  - `name`: Display label.
  - `specificity`: Domain priority tier (`HIGH | MEDIUM | GENERIC`).
  - `detect(input: T): Promise<DetectorResult<TResult>> | DetectorResult<TResult>`.
  - `renderBox(props: BoxRenderProps<TResult>): ReactNode`.
- **`DetectorRegistry<T>`**:
  - `register(detector: RegisteredDetector<T, any>)`: Register new detectors dynamically.
  - `evaluate(input: T): Promise<DetectedBoxInstance[]> | DetectedBoxInstance[]`: Executes registered detectors, filters matches (score > 0), sorts by composite priority `(score, specificity)`, and returns the ordered `[]Boxes`.

### 2. Standardized Detector Adapters (`src/services/detectors/*` or modular registry bindings)
Wrap existing analytical engines into the standardized detector interface:
- **IP Detector**: Checks for IPv4 / IPv6 / CIDR. When valid IP, returns `score = 100`, `specificity = HIGH (100)`.
- **JWT Detector**: Checks 3-part Base64URL pattern with valid headers. Score = 100, `specificity = HIGH (100)`.
- **JWKS Detector**: Triggered when JWT has `iss` or input contains JWKS structure. Score = 95, `specificity = HIGH (100)`.
- **Certificates Detector (X.509)**: Detects PEM certificate boundaries or ASN.1 DER. Score = 100, `specificity = HIGH (100)`.
- **Kubernetes Detector**: Detects apiVersion, kind, secret manifest structure. Score = 95, `specificity = HIGH (100)`.
- **JSON Detector**: Validates parseable JSON structures (arrays/objects). Score = 90, `specificity = MEDIUM (60)`.
- **URI Detector**: Detects URLs, query strings, protocols. Score = 85, `specificity = MEDIUM (50)`.
- **Hex/Dec/Binary Detector**: Detects numeric bases. Score = 70, `specificity = MEDIUM (40)`.
- **Base64 Detector**: Detects valid Base64 / Base32 strings. Score = 70, `specificity = MEDIUM (40)`.
- **Hash / CRC Detector**: Generic catch-all tool. Scores 25 with `specificity = GENERIC (10)`, ensuring it stays visible when input is present, but strictly sorted after high-confidence domain tools like IP or JWT.

### 3. Refactor `src/App.tsx` to Consume `T -> []Boxes`
- Replace hardcoded static JSX box layout with dynamic rendering of `detectedBoxes.map(box => box.render(...))` while preserving:
  - Manual category filtering (`activeCategory`).
  - Tool focus mode (`focusedTool`).
  - User toggle preferences (`enabledDetectors`).
  - Zero-input state (empty screen on first visit, clean textarea with placeholder).
- Retain two-way updates between boxes and parent input stream (`onUpdateInput={setInput}`).

## Verification Plan

### Automated Verification
- Run `npm run lint` and `compile_applet` to ensure TypeScript typings, React hook dependencies, and registry contracts build with zero errors.

### Manual Verification Scenarios
1. **IP Test Input** (`192.168.1.1` or `10.0.0.1/24`):
   - Verify that **IP Box** is rendered as the topmost box.
   - Verify that generic **Hash / CRC Box** appears at the bottom.
2. **JWT Test Input**:
   - Verify **JWT Box** and **JWKS Box** appear on top; Hash/CRC box at bottom.
3. **Empty Input**:
   - Verify zero boxes are rendered, leaving the clean textarea without mock demos.
4. **Filtering and Toggles**:
   - Verify category selector tabs still filter properly.
   - Verify expand/focus mode works on any detected box.
