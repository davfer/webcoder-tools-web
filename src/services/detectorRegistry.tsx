import React from 'react';
import { ToolCategory } from '../types';
import { analyzeIp, IpAnalysis } from '../utils/ipEngine';
import { analyzeJwt, JwtAnalysis } from '../utils/jwtEngine';
import { analyzeJson, JsonAnalysis } from '../utils/jsonEngine';
import { analyzeUri, UriAnalysis } from '../utils/uriEngine';
import { analyzeHexDec, HexDecAnalysis } from '../utils/hexDecEngine';
import { analyzeBase64, Base64Analysis } from '../utils/base64Engine';
import { analyzeK8s, K8sAnalysis } from '../utils/k8sEngine';
import { CertAnalysis } from '../utils/certsEngine';
import { detectHashType } from '../utils/hashEngine';

// Components
import { IpBox } from '../components/detectors/IpBox';
import { JwtBox } from '../components/detectors/JwtBox';
import { JwksBox } from '../components/detectors/JwksBox';
import { JsonBox } from '../components/detectors/JsonBox';
import { CertsBox } from '../components/detectors/CertsBox';
import { K8sBox } from '../components/detectors/K8sBox';
import { UriBox } from '../components/detectors/UriBox';
import { Base64Box } from '../components/detectors/Base64Box';
import { HexDecBox } from '../components/detectors/HexDecBox';
import { HashBox } from '../components/detectors/HashBox';
import { OidcBox } from '../components/detectors/OidcBox';

export type SpecificityTier = 'SPECIFIC' | 'STRUCTURAL' | 'TRANSFORM' | 'GENERIC';

export const SPECIFICITY_RANKS: Record<SpecificityTier, number> = {
  SPECIFIC: 100,  // Domain-specific payloads: IP, JWT, JWKS, X.509, Kubernetes
  STRUCTURAL: 60, // Structured data: JSON, URI
  TRANSFORM: 40,  // Base encodings and representations: Hex/Dec/Bin, Base64
  GENERIC: 10,    // Universal compute & playground tools: Hash/CRC, OIDC
};

export interface DetectorContext {
  input: string;
  trimmed: string;
  hasInput: boolean;
  activeCategory?: ToolCategory;
  jwtResult?: JwtAnalysis;
  certAnalysis?: CertAnalysis;
}

export interface DetectorMatch<TData = any> {
  matched: boolean;
  score: number; // 0 to 100
  specificityTier: SpecificityTier;
  specificityRank: number;
  effectiveRank: number; // (score * 1000) + specificityRank
  badge?: string;
  summary?: string;
  data?: TData;
}

export interface BoxRenderProps {
  input: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export interface Detector<TInput = string, TData = any> {
  id: ToolCategory;
  name: string;
  category: ToolCategory;
  defaultSpecificity: SpecificityTier;
  detect: (input: TInput, ctx: DetectorContext) => DetectorMatch<TData>;
  renderBox: (props: BoxRenderProps, match: DetectorMatch<TData>, ctx: DetectorContext) => React.ReactNode;
}

export interface DetectedBox {
  id: ToolCategory;
  name: string;
  category: ToolCategory;
  score: number;
  specificityTier: SpecificityTier;
  specificityRank: number;
  effectiveRank: number;
  badge?: string;
  summary?: string;
  render: (props: BoxRenderProps) => React.ReactNode;
}

/**
 * Standard calculation for effective priority rank.
 * Uses (score * 1000) + specificityRank to break ties.
 * Ensures domain-specific matches (e.g., valid IP = 100 * 1000 + 100 = 100100)
 * rank well above generic tools (Hash / CRC = 25 * 1000 + 10 = 25010).
 */
export function calculateEffectiveRank(score: number, specificityRank: number): number {
  return score * 1000 + specificityRank;
}

/**
 * DetectorRegistry machine:
 * Manages registered detectors and executes the T -> []Boxes detection pipeline.
 */
export class DetectorRegistry {
  private detectors: Map<ToolCategory, Detector<string, any>> = new Map();

  constructor() {
    this.registerDefaultDetectors();
  }

  register<TData>(detector: Detector<string, TData>) {
    this.detectors.set(detector.id, detector);
  }

  unregister(id: ToolCategory) {
    this.detectors.delete(id);
  }

  get(id: ToolCategory): Detector<string, any> | undefined {
    return this.detectors.get(id);
  }

  getAll(): Detector<string, any>[] {
    return Array.from(this.detectors.values());
  }

  /**
   * T -> []Boxes
   * Evaluates input string T and returns an ordered array of detected box descriptors
   */
  evaluate(input: string, context: Partial<DetectorContext> = {}): DetectedBox[] {
    const trimmed = input.trim();
    const hasInput = trimmed.length > 0;
    if (!hasInput) return [];

    const fullCtx: DetectorContext = {
      input,
      trimmed,
      hasInput,
      ...context,
    };

    const boxes: DetectedBox[] = [];

    for (const detector of this.detectors.values()) {
      try {
        const match = detector.detect(input, fullCtx);
        if (match.matched && match.score > 0) {
          boxes.push({
            id: detector.id,
            name: detector.name,
            category: detector.category,
            score: match.score,
            specificityTier: match.specificityTier,
            specificityRank: match.specificityRank,
            effectiveRank: match.effectiveRank,
            badge: match.badge,
            summary: match.summary,
            render: (props: BoxRenderProps) => detector.renderBox(props, match, fullCtx),
          });
        }
      } catch (err) {
        console.error(`DetectorRegistry error in ${detector.id}:`, err);
      }
    }

    // Sort descending by effectiveRank (score * 1000 + specificityRank)
    return boxes.sort((a, b) => b.effectiveRank - a.effectiveRank);
  }

  private registerDefaultDetectors() {
    // 1. IP & CIDR Detector (High domain specificity)
    this.register<IpAnalysis>({
      id: 'ip',
      name: 'IP & Subnets',
      category: 'ip',
      defaultSpecificity: 'SPECIFIC',
      detect: (input) => {
        const analysis = analyzeIp(input);
        if (!analysis.isIp) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'SPECIFIC',
            specificityRank: SPECIFICITY_RANKS.SPECIFIC,
            effectiveRank: 0,
          };
        }
        const score = 100;
        const rank = SPECIFICITY_RANKS.SPECIFIC;
        return {
          matched: true,
          score,
          specificityTier: 'SPECIFIC',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: analysis.version === 6 ? 'IPv6' : analysis.isCidr ? 'IPv4 CIDR' : 'IPv4',
          summary: `${analysis.ip} (${analysis.ipType})`,
          data: analysis,
        };
      },
      renderBox: (props, match) => (
        <IpBox
          analysis={match.data || analyzeIp(props.input)}
          rawInput={props.input}
          isFocused={props.isFocused}
          onToggleFocus={props.onToggleFocus}
          onUpdateInput={props.onUpdateInput}
        />
      ),
    });

    // 2. JWT Detector (High domain specificity)
    this.register<JwtAnalysis>({
      id: 'jwt',
      name: 'JSON Web Token (JWT)',
      category: 'jwt',
      defaultSpecificity: 'SPECIFIC',
      detect: (input, ctx) => {
        const analysis = ctx.jwtResult || analyzeJwt(input);
        if (!analysis.isJwt) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'SPECIFIC',
            specificityRank: SPECIFICITY_RANKS.SPECIFIC,
            effectiveRank: 0,
          };
        }
        const score = 100;
        const rank = SPECIFICITY_RANKS.SPECIFIC;
        return {
          matched: true,
          score,
          specificityTier: 'SPECIFIC',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: analysis.header?.alg || 'JWT',
          summary: analysis.payload?.iss ? `Issuer: ${analysis.payload.iss}` : 'Valid JWT structure',
          data: analysis,
        };
      },
      renderBox: (props, match) => (
        <JwtBox
          analysis={match.data || analyzeJwt(props.input)}
          rawInput={props.input}
          isFocused={props.isFocused}
          onToggleFocus={props.onToggleFocus}
          onUpdateInput={props.onUpdateInput}
        />
      ),
    });

    // 3. JWKS Detector (Triggered on JWT with iss or explicit JWKS JSON / keys)
    this.register({
      id: 'jwks',
      name: 'JWKS Key Set & Signature Validator',
      category: 'jwks',
      defaultSpecificity: 'SPECIFIC',
      detect: (input, ctx) => {
        const jwt = ctx.jwtResult || analyzeJwt(input);
        const hasJwksKeyword = input.toLowerCase().includes('jwks') || input.toLowerCase().includes('"keys"');
        const hasJwtIssuer = jwt.isJwt && !!jwt.payload?.iss;
        const matched = hasJwtIssuer || hasJwksKeyword;

        if (!matched) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'SPECIFIC',
            specificityRank: SPECIFICITY_RANKS.SPECIFIC,
            effectiveRank: 0,
          };
        }

        // Slightly lower than JWT itself so JWT card renders immediately above JWKS box
        const score = hasJwtIssuer ? 98 : 95;
        const rank = SPECIFICITY_RANKS.SPECIFIC - 1;
        return {
          matched: true,
          score,
          specificityTier: 'SPECIFIC',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: jwt.header?.kid ? `Key: ${jwt.header.kid}` : 'OIDC Discovery',
          summary: 'JWKS Public Key Verification Engine',
        };
      },
      renderBox: (props, _, ctx) => {
        const jwt = ctx.jwtResult || analyzeJwt(ctx.input);
        return (
          <JwksBox
            jwtString={props.input}
            issuerClaim={jwt.payload?.iss}
            tokenKid={jwt.header?.kid}
            tokenAlg={jwt.header?.alg}
            isFocused={props.isFocused}
            onToggleFocus={props.onToggleFocus}
          />
        );
      },
    });

    // 4. X.509 Certificates & CSRs
    this.register<CertAnalysis>({
      id: 'certs',
      name: 'X.509 Certificate & Keys',
      category: 'certs',
      defaultSpecificity: 'SPECIFIC',
      detect: (_, ctx) => {
        const cert = ctx.certAnalysis;
        const trimmed = ctx.trimmed;
        const hasPemMarkers =
          trimmed.includes('-----BEGIN CERTIFICATE-----') ||
          trimmed.includes('BEGIN RSA PRIVATE KEY') ||
          trimmed.includes('BEGIN PRIVATE KEY') ||
          trimmed.includes('BEGIN CERTIFICATE REQUEST');

        if (!hasPemMarkers && (!cert || !cert.isCert)) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'SPECIFIC',
            specificityRank: SPECIFICITY_RANKS.SPECIFIC,
            effectiveRank: 0,
          };
        }

        const score = 100;
        const rank = SPECIFICITY_RANKS.SPECIFIC;
        return {
          matched: true,
          score,
          specificityTier: 'SPECIFIC',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: cert?.type ? cert.type.toUpperCase() : 'X.509',
          summary: cert?.commonName || 'Certificate PEM',
          data: cert,
        };
      },
      renderBox: (props, match, ctx) => {
        const analysis = match.data || ctx.certAnalysis || {
          isCert: true,
          type: 'none' as const,
          subject: '',
          issuer: '',
          commonName: '',
          rawPem: props.input,
        };
        return (
          <CertsBox
            analysis={analysis}
            rawInput={props.input}
            isFocused={props.isFocused}
            onToggleFocus={props.onToggleFocus}
            onUpdateInput={props.onUpdateInput}
          />
        );
      },
    });

    // 5. Kubernetes Resource Manifests
    this.register<K8sAnalysis>({
      id: 'k8s',
      name: 'Kubernetes Resource & Secrets',
      category: 'k8s',
      defaultSpecificity: 'SPECIFIC',
      detect: (input) => {
        const analysis = analyzeK8s(input);
        if (!analysis.isK8s) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'SPECIFIC',
            specificityRank: SPECIFICITY_RANKS.SPECIFIC,
            effectiveRank: 0,
          };
        }
        const score = 95;
        const rank = SPECIFICITY_RANKS.SPECIFIC;
        const primaryResource = analysis.resources[0];
        return {
          matched: true,
          score,
          specificityTier: 'SPECIFIC',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: primaryResource?.kind || 'K8s',
          summary: primaryResource?.name ? `Name: ${primaryResource.name}` : 'Kubernetes Manifest',
          data: analysis,
        };
      },
      renderBox: (props, match) => (
        <K8sBox
          analysis={match.data || analyzeK8s(props.input)}
          rawInput={props.input}
          isFocused={props.isFocused}
          onToggleFocus={props.onToggleFocus}
          onUpdateInput={props.onUpdateInput}
        />
      ),
    });

    // 6. JSON Structure Detector (Structural specificity)
    this.register<JsonAnalysis>({
      id: 'json',
      name: 'JSON Beautifier & Validator',
      category: 'json',
      defaultSpecificity: 'STRUCTURAL',
      detect: (input) => {
        const analysis = analyzeJson(input);
        if (!analysis.isValidJson) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'STRUCTURAL',
            specificityRank: SPECIFICITY_RANKS.STRUCTURAL,
            effectiveRank: 0,
          };
        }
        // Objects and Arrays score highest in JSON
        const isStructured = analysis.stats.type === 'object' || analysis.stats.type === 'array';
        const score = isStructured ? 90 : 50;
        const rank = SPECIFICITY_RANKS.STRUCTURAL;
        return {
          matched: true,
          score,
          specificityTier: 'STRUCTURAL',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: analysis.stats.type,
          summary: `${analysis.stats.keysCount} keys, ${analysis.stats.sizeBytes} bytes`,
          data: analysis,
        };
      },
      renderBox: (props, match) => (
        <JsonBox
          analysis={match.data || analyzeJson(props.input)}
          rawInput={props.input}
          isFocused={props.isFocused}
          onToggleFocus={props.onToggleFocus}
          onUpdateInput={props.onUpdateInput}
        />
      ),
    });

    // 7. URI / URL Detector (Structural specificity)
    this.register<UriAnalysis>({
      id: 'uri',
      name: 'URI & Query Inspector',
      category: 'uri',
      defaultSpecificity: 'STRUCTURAL',
      detect: (input) => {
        const analysis = analyzeUri(input);
        if (!analysis.isUri) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'STRUCTURAL',
            specificityRank: SPECIFICITY_RANKS.STRUCTURAL,
            effectiveRank: 0,
          };
        }
        const score = analysis.protocol.startsWith('http') ? 85 : 70;
        const rank = SPECIFICITY_RANKS.STRUCTURAL - 5;
        return {
          matched: true,
          score,
          specificityTier: 'STRUCTURAL',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: analysis.protocol || 'URI',
          summary: analysis.host || analysis.pathname,
          data: analysis,
        };
      },
      renderBox: (props, match) => (
        <UriBox
          analysis={match.data || analyzeUri(props.input)}
          rawInput={props.input}
          isFocused={props.isFocused}
          onToggleFocus={props.onToggleFocus}
          onUpdateInput={props.onUpdateInput}
        />
      ),
    });

    // 8. Base64 & Base32 Detector (Transform specificity)
    this.register<Base64Analysis>({
      id: 'base64',
      name: 'Base64 & Base32 Inspector',
      category: 'base64',
      defaultSpecificity: 'TRANSFORM',
      detect: (input) => {
        const analysis = analyzeBase64(input);
        if (!analysis.isBase64) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'TRANSFORM',
            specificityRank: SPECIFICITY_RANKS.TRANSFORM,
            effectiveRank: 0,
          };
        }
        // Lower confidence for single plain numbers or words that happen to be valid base64
        const score = analysis.encodedSize > 16 ? 65 : 45;
        const rank = SPECIFICITY_RANKS.TRANSFORM;
        return {
          matched: true,
          score,
          specificityTier: 'TRANSFORM',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: analysis.type === 'url-safe' ? 'Base64URL' : analysis.type === 'base32' ? 'Base32' : 'Base64',
          summary: `Decodes to ${analysis.decodedSize} bytes`,
          data: analysis,
        };
      },
      renderBox: (props, match) => (
        <Base64Box
          analysis={match.data || analyzeBase64(props.input)}
          rawInput={props.input}
          isFocused={props.isFocused}
          onToggleFocus={props.onToggleFocus}
          onUpdateInput={props.onUpdateInput}
        />
      ),
    });

    // 9. Hex / Dec / Binary Inspector (Transform specificity)
    this.register<HexDecAnalysis>({
      id: 'hexdec',
      name: 'Radix, Hex & Decimal',
      category: 'hexdec',
      defaultSpecificity: 'TRANSFORM',
      detect: (input) => {
        const analysis = analyzeHexDec(input);
        if (!analysis.isConvertible) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'TRANSFORM',
            specificityRank: SPECIFICITY_RANKS.TRANSFORM,
            effectiveRank: 0,
          };
        }
        const score = analysis.detectedType === 'hex' || analysis.detectedType === 'binary' ? 60 : 40;
        const rank = SPECIFICITY_RANKS.TRANSFORM - 5;
        return {
          matched: true,
          score,
          specificityTier: 'TRANSFORM',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: analysis.detectedType,
          summary: `Base ${analysis.detectedType}`,
          data: analysis,
        };
      },
      renderBox: (props, match) => (
        <HexDecBox
          analysis={match.data || analyzeHexDec(props.input)}
          rawInput={props.input}
          isFocused={props.isFocused}
          onToggleFocus={props.onToggleFocus}
          onUpdateInput={props.onUpdateInput}
        />
      ),
    });

    // 10. Hash, CRC & Checksum Tool (Generic specificity - kept visible at the bottom)
    this.register({
      id: 'hash',
      name: 'Hashes & CRC Checksums',
      category: 'hash',
      defaultSpecificity: 'GENERIC',
      detect: (_, ctx) => {
        if (!ctx.hasInput) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'GENERIC',
            specificityRank: SPECIFICITY_RANKS.GENERIC,
            effectiveRank: 0,
          };
        }

        const hashDetection = detectHashType(ctx.trimmed);
        // If input specifically matches a known hash pattern (e.g., md5 or sha256 hex string), boost score
        const score = hashDetection.isLikelyHash ? 75 : 25;
        const rank = hashDetection.isLikelyHash ? SPECIFICITY_RANKS.STRUCTURAL : SPECIFICITY_RANKS.GENERIC;

        return {
          matched: true,
          score,
          specificityTier: hashDetection.isLikelyHash ? 'STRUCTURAL' : 'GENERIC',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: hashDetection.isLikelyHash ? hashDetection.algorithm : 'Checksums',
          summary: hashDetection.isLikelyHash ? `Likely ${hashDetection.algorithm}` : 'CRC32 / MD5 / SHA / Keccak',
        };
      },
      renderBox: (props) => (
        <HashBox
          rawInput={props.input}
          isFocused={props.isFocused}
          onToggleFocus={props.onToggleFocus}
          onUpdateInput={props.onUpdateInput}
        />
      ),
    });

    // 11. OAuth 2.0 / OIDC Testing Playground
    this.register({
      id: 'oidc',
      name: 'OAuth 2.0 / OIDC Playground',
      category: 'oidc',
      defaultSpecificity: 'GENERIC',
      detect: (input, ctx) => {
        const lower = input.toLowerCase();
        const isOidcKeyword = lower.includes('oauth') || lower.includes('openid') || lower.includes('token_endpoint') || lower.includes('authorize');
        const isTabSelected = ctx.activeCategory === 'oidc';

        if (!isTabSelected && !isOidcKeyword) {
          return {
            matched: false,
            score: 0,
            specificityTier: 'GENERIC',
            specificityRank: SPECIFICITY_RANKS.GENERIC,
            effectiveRank: 0,
          };
        }

        const score = isTabSelected ? 90 : 30;
        const rank = SPECIFICITY_RANKS.GENERIC;
        return {
          matched: true,
          score,
          specificityTier: 'GENERIC',
          specificityRank: rank,
          effectiveRank: calculateEffectiveRank(score, rank),
          badge: 'OAuth 2.0',
          summary: 'Flow debugger & PKCE tester',
        };
      },
      renderBox: (props) => (
        <OidcBox
          rawInput={props.input}
          isFocused={props.isFocused}
          onToggleFocus={props.onToggleFocus}
          onUpdateInput={props.onUpdateInput}
        />
      ),
    });
  }
}

// Global default singleton registry
export const defaultDetectorRegistry = new DetectorRegistry();
