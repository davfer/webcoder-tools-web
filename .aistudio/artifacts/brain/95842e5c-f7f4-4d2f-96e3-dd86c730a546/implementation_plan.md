# Implementation Plan: Semantic-Release Versioning & Icon-Only Copy Button Polish

Set up automated versioning via **semantic-release** and GitHub Actions, dynamically wire the footer version badge to live GitHub releases with changelog linking, and complete the copy button coverage across all detector boxes using pure icon-only buttons.

## User Review Required

> [!IMPORTANT]
> **Dynamic Version Resolution & Fallback Behavior**
> - The web application will dynamically query `https://api.github.com/repos/davfer/webcoder-tools-web/releases/latest` on load.
> - When a GitHub release exists, the badge displays that release's `tag_name` and links directly to its release changelog (`html_url`) in a new tab.
> - If offline, rate-limited, or when no GitHub release has been cut yet (HTTP 404), it falls back seamlessly to the version defined in `package.json` (`v1.0.0`) and links to `https://github.com/davfer/webcoder-tools-web/releases`.

---

## Proposed Changes

### 1. Dynamic Versioning & Footer Release Badge (`src/components/Footer.tsx`)
- Replace the static `v1.0.0-pwa` text with a dynamic release badge component.
- Fetch the latest release metadata (`tag_name`, `html_url`, `published_at`) from the GitHub REST API (`https://api.github.com/repos/davfer/webcoder-tools-web/releases/latest`).
- Render the version as an interactive link badge:
  - Visual: Subtle, elegant badge with `Tag` icon, current release version tag, and hover elevation.
  - Interaction: Clicking opens the corresponding GitHub release changelog in a new browser tab (`target="_blank"`, `rel="noopener noreferrer"`).
  - Resilient fallback: Gracefully handles network isolation, rate limits, or pre-release states by displaying the local `package.json` version fallback.

### 2. Semantic-Release & GitHub Actions Configuration
Establish a complete, automated semantic release pipeline adhering to conventional commits:
- **`.releaserc.json`**:
  - `@semantic-release/commit-analyzer`: Detects `feat:`, `fix:`, `perf:`, `BREAKING CHANGE:`.
  - `@semantic-release/release-notes-generator`: Formats markdown release notes and changelog categories.
  - `@semantic-release/changelog`: Maintains root `CHANGELOG.md`.
  - `@semantic-release/npm`: Updates `version` in `package.json` (`npmPublish: false` to avoid pushing a web app to npm registry).
  - `@semantic-release/git`: Commits `CHANGELOG.md` and `package.json` with `[skip ci] chore(release): ${nextRelease.version}`.
  - `@semantic-release/github`: Publishes GitHub Releases with release notes and assets.
- **`.github/workflows/release.yml`**:
  - GitHub Actions workflow running on pushes to `main` branch.
  - Sets up Node.js 20, installs dependencies, validates with `npm run build`, and executes `npx semantic-release`.
- **`package.json`**:
  - Add `"release": "semantic-release"` script and necessary devDependencies.

### 3. Icon-Only Copy Buttons & Missing Action Fill
Audit every detector box and add missing copy buttons, ensuring all copy triggers are strictly icon-only (`<Copy />` / `<Check />`) with descriptive tooltip `title` and `aria-label`:
- **`src/components/detectors/UriBox.tsx`**:
  - Add copy button to URI Scheme (`protocol`).
  - Add copy button to Fragment / Hash component.
  - Add copy button to DNS IPv4 and IPv6 resolution entries.
  - Add copy button to individual Traceroute Hop IP entries.
- **`src/components/detectors/Base64Box.tsx`**:
  - Add copy button directly inside the decoded output pre-block (both text view and hex dump).
- **`src/components/detectors/JwksBox.tsx`**:
  - Add copy button for matched Key ID (`kid`), Key Type (`kty`), Algorithm (`alg`), and Intended Use (`use`).
  - Add copy button for raw JWKS keys JSON.
- **Verify All Other Boxes** (`IpBox`, `HashBox`, `HexDecBox`, `JwtBox`, `CertsBox`, `K8sBox`, `OidcBox`, `JsonBox`):
  - Ensure zero residual "Copy" text strings in buttons.
  - Ensure all copy buttons give temporary `<Check className="text-emerald-400" />` feedback and reset after 1.8 seconds.

---

## Verification Plan

### Automated Verification
- Run `compile_applet` to verify TypeScript builds without errors.
- Run `npm run lint` or syntax checks to ensure all props, imports, and handlers are valid.

### Manual Verification Scenarios
1. **Footer Release Badge**:
   - Inspect footer: verify the version badge renders cleanly with a tag icon.
   - Verify clicking the version badge opens the GitHub releases URL in a new tab.
   - Verify that simulated network error falls back safely to package version without UI breakage.
2. **Missing Copy Buttons**:
   - Test URI inspection (e.g. `https://example.com:8080/path#section`): click copy on Scheme, Host, Path, and Fragment to confirm clipboard copy and visual checkmark feedback.
   - Test Base64 tool: click copy on decoded output.
   - Test JWKS tool: verify copy buttons on matched key metadata.
3. **Semantic-Release Files**:
   - Confirm `.releaserc.json` and `.github/workflows/release.yml` are correctly structured and formatted.
