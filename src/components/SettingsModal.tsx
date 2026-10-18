import React from 'react';
import { X, Trash2, Shield, Sliders } from 'lucide-react';
import { ToolCategory } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  enabledDetectors: Record<ToolCategory, boolean>;
  onToggleDetector: (category: ToolCategory) => void;
  onClearStorage: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  enabledDetectors,
  onToggleDetector,
  onClearStorage,
}) => {
  if (!isOpen) return null;

  const detectors: { id: ToolCategory; label: string; desc: string }[] = [
    { id: 'base64', label: 'Base64 & Base32', desc: 'Inspects and decodes RFC 4648 Base64 payloads' },
    { id: 'json', label: 'JSON Inspector', desc: 'Validates syntax, formats, and executes dot-notation queries' },
    { id: 'jwt', label: 'JWT Token Inspector', desc: 'Decodes header/claims and tracks expiration' },
    { id: 'jwks', label: 'JWKS Signature Validator', desc: 'Discovers jwks_uri via openid-configuration and validates signatures' },
    { id: 'hash', label: 'Hash & Checksums', desc: 'Calculates CRC32, MD5, SHA digests and checks passwords' },
    { id: 'uri', label: 'URI & Network', desc: 'Dissects query parameters and provides live CORS/timings ping' },
    { id: 'hexdec', label: 'Hex / Dec / Bin', desc: 'Converts between numeric bases and raw bytes' },
    { id: 'ip', label: 'IP & CIDR Subnet', desc: 'Subnet calculator and IPv4/IPv6 classification' },
    { id: 'certs', label: 'X.509 Certificates', desc: 'Parses PEM certificates and fingerprints' },
    { id: 'k8s', label: 'Kubernetes Resources', desc: 'Parses manifests and reveals base64 encoded Secrets' },
    { id: 'oidc', label: 'OAuth 2.0 / OIDC', desc: 'PKCE challenge calculator and local token issuer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-mono text-xs text-slate-200">
        <div className="flex items-center justify-between px-5 py-4 bg-[#161F30] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-100 text-sm">Workbench Settings</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Detectors toggles */}
          <div>
            <div className="text-slate-400 font-semibold mb-2">ACTIVE AUTO-DETECTORS:</div>
            <div className="space-y-2">
              {detectors.map((d) => (
                <label
                  key={d.id}
                  className="flex items-center justify-between p-2.5 bg-[#0B0F17] rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-100">{d.label}</div>
                    <div className="text-[11px] text-slate-500">{d.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enabledDetectors[d.id] ?? true}
                    onChange={() => onToggleDetector(d.id)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* GitHub Actions CI/CD & Artifact Downloads */}
          <div className="p-3.5 bg-slate-900/80 rounded-lg border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-semibold">GITHUB ACTIONS & WEBSITE ARTIFACT DOWNLOADS</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px]">
                CI / Tests Passing
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Whenever code is merged to <code className="text-cyan-300 font-bold">main</code>, the GitHub Actions pipeline runs all 13 unit tests, compiles the production PWA, and pushes downloadable production archives.
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between p-2 bg-[#0B0F17] rounded border border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-bold">webcoder-tools-dist.zip</span>
                  <span className="text-slate-500">(Production Website Bundle)</span>
                </div>
                <a
                  href="https://github.com/webcoder-tools/webcoder/releases/tag/release-latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40"
                >
                  Download .zip
                </a>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0B0F17] rounded border border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-bold">webcoder-tools-dist.tar.gz</span>
                  <span className="text-slate-500">(Linux/Docker Host Archive)</span>
                </div>
                <a
                  href="https://github.com/webcoder-tools/webcoder/releases/tag/release-latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Download .tar.gz
                </a>
              </div>
            </div>
          </div>

          {/* Go Backend Readiness */}
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1.5">
            <div className="text-cyan-400 font-semibold">GO BACKEND GATEWAY</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Computation currently runs 100% client-side in-browser. When the Go backend is deployed, complex operations (such as kernel-level traceroute raw sockets and live TLS cert chain extraction) can be proxied through this endpoint.
            </p>
            <input
              type="text"
              disabled
              value="http://localhost:8080 (Client fallback active)"
              className="w-full px-2.5 py-1.5 bg-[#0B0F17] border border-slate-800 rounded text-slate-500 text-xs"
            />
          </div>

          {/* Storage & Privacy */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-slate-300 font-semibold">Purge Local Data</div>
              <div className="text-[11px] text-slate-500">Clears input text and network audit history</div>
            </div>
            <button
              onClick={() => {
                onClearStorage();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
