import React, { useState, useEffect } from 'react';
import {
  runJwksVerification,
  JwksData,
  discoverJwksUri,
  fetchJwks,
} from '../../utils/jwksEngine';
import { JwksValidationResult } from '../../types';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  SlidersHorizontal,
  FileCode2,
} from 'lucide-react';

interface Props {
  jwtString: string;
  issuerClaim?: string;
  tokenKid?: string;
  tokenAlg?: string;
  isFocused: boolean;
  onToggleFocus: () => void;
}

export const JwksBox: React.FC<Props> = ({
  jwtString,
  issuerClaim,
  tokenKid,
  tokenAlg,
  isFocused,
  onToggleFocus,
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<JwksValidationResult | null>(null);

  // Configuration modes
  const [mode, setMode] = useState<'auto' | 'custom_url' | 'custom_json'>('auto');
  const [customUrl, setCustomUrl] = useState('');
  const [customJsonText, setCustomJsonText] = useState('');
  const [showKeysJson, setShowKeysJson] = useState(false);
  const [fetchedJwks, setFetchedJwks] = useState<JwksData | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setResult(null);

    try {
      let options: any = {};
      if (mode === 'custom_url' && customUrl.trim()) {
        options.customJwksUrl = customUrl.trim();
      } else if (mode === 'custom_json' && customJsonText.trim()) {
        try {
          options.customJwksJson = JSON.parse(customJsonText.trim());
        } catch {
          setResult({
            status: 'error',
            signatureVerified: false,
            message: 'Invalid JSON entered in custom JWKS field. It must conform to RFC 7517.',
          });
          setLoading(false);
          return;
        }
      } else if (issuerClaim) {
        options.customIssuer = issuerClaim;
      }

      const res = await runJwksVerification(jwtString, options);
      setResult(res);

      // If we have jwksUri, fetch full data for raw viewer
      if (res.jwksUri && !fetchedJwks) {
        fetchJwks(res.jwksUri)
          .then((data) => setFetchedJwks(data))
          .catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if issuer is present
  useEffect(() => {
    if (issuerClaim && !result && mode === 'auto') {
      handleVerify();
    }
  }, [issuerClaim, jwtString]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-sm font-semibold text-slate-100">JWKS Public Key & Signature Validator</span>
          <span className="text-xs px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 text-purple-300 font-mono">
            RFC 7517
          </span>
          {tokenKid && (
            <span className="text-xs text-slate-400 font-mono truncate max-w-xs">
              target kid: <strong className="text-purple-300">{tokenKid}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(result?.jwksUri || issuerClaim) && (
            <button
              onClick={() => handleCopy(result?.jwksUri || issuerClaim || '')}
              className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={copied ? 'Copied' : 'Copy JWKS URI / Issuer'}
              aria-label="Copy JWKS URI / Issuer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{loading ? 'Verifying...' : 'Verify Signature'}</span>
          </button>

          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-purple-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus JWKS Tool'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 font-mono text-xs">
        {/* Source Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#0B0F17] rounded-lg border border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode('auto')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'auto'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Auto-Discovery (iss claim)
            </button>
            <button
              onClick={() => setMode('custom_url')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'custom_url'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom JWKS URL
            </button>
            <button
              onClick={() => setMode('custom_json')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'custom_json'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paste JWKS JSON
            </button>
          </div>

          <span className="text-[11px] text-slate-500">
            Conforms to RFC 7517 & OIDC Core 1.0
          </span>
        </div>

        {/* Mode-Specific Input */}
        {mode === 'auto' && (
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-purple-300">DISCOVERED ISSUER:</span>
              <span className="text-[11px] text-slate-500">Extracted from JWT payload 'iss'</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#0B0F17] rounded border border-slate-800 text-slate-200">
              <span className="select-all truncate mr-2">{issuerClaim || '[No "iss" claim found in token. Please use Custom JWKS URL or JSON]'}</span>
              {issuerClaim && (
                <button
                  onClick={() => handleCopy(issuerClaim)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors shrink-0"
                  title="Copy Issuer URL"
                  aria-label="Copy Issuer URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        )}

        {mode === 'custom_url' && (
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-purple-300">CUSTOM JWKS ENDPOINT URL:</span>
              <span className="text-[11px] text-amber-400">Must conform to RFC 7517 specification</span>
            </div>
            <input
              type="text"
              placeholder="https://your-idp.example.com/.well-known/jwks.json"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {mode === 'custom_json' && (
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-purple-300">RAW RFC 7517 JWKS JSON:</span>
              <span className="text-[11px] text-slate-500">{"{\"keys\": [{\"kty\":\"RSA\", \"kid\": \"...\", ...}]}"}</span>
            </div>
            <textarea
              rows={4}
              placeholder='{"keys": [{"kty": "RSA", "kid": "my-key-id", "use": "sig", "n": "...", "e": "AQAB"}]}'
              value={customJsonText}
              onChange={(e) => setCustomJsonText(e.target.value)}
              className="w-full p-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono text-xs"
            />
          </div>
        )}

        {/* Verification Status Banner & Details */}
        {result && (
          <div className="space-y-3 pt-1">
            {/* Status Alert */}
            {result.status === 'verified' && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-lg flex items-start gap-3 text-emerald-200">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-emerald-300">SIGNATURE VALID & VERIFIED</div>
                  <div className="mt-0.5 text-xs text-emerald-400/90">{result.message}</div>
                </div>
              </div>
            )}

            {result.status === 'invalid_signature' && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/50 rounded-lg flex items-start gap-3 text-rose-200">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-rose-300">SIGNATURE MISMATCH</div>
                  <div className="mt-0.5 text-xs text-rose-400/90">{result.message}</div>
                </div>
              </div>
            )}

            {result.status === 'key_not_found' && (
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/50 rounded-lg flex items-start gap-3 text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-amber-300">MATCHING KEY ID (kid) NOT FOUND</div>
                  <div className="mt-0.5 text-xs text-amber-400/90">{result.message}</div>
                </div>
              </div>
            )}

            {result.status === 'error' && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/50 rounded-lg space-y-2 text-rose-200">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>DISCOVERY / FETCH ERROR</span>
                </div>
                <div className="text-xs text-rose-300/90">{result.message}</div>
                <div className="pt-2 border-t border-rose-900/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Blocked by CORS in browser?</span>
                  <button
                    onClick={() => setMode('custom_json')}
                    className="text-purple-300 underline hover:text-white"
                  >
                    Switch to Paste JWKS JSON Fallback
                  </button>
                </div>
              </div>
            )}

            {/* Matched Key Specifications Card */}
            {result.matchedKid && (
              <div className="p-3.5 bg-[#0B0F17] rounded-lg border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-purple-400">MATCHED KEY SPECIFICATIONS:</span>
                  <span className="text-slate-500 text-[11px]">
                    from {result.totalKeysFound || 1} available key(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                    <div className="text-slate-500 text-[11px]">Matched kid (Key ID)</div>
                    <div className="font-bold text-purple-300 truncate" title={result.matchedKid}>
                      {result.matchedKid}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                    <div className="text-slate-500 text-[11px]">Key Type (kty)</div>
                    <div className="font-bold text-slate-200">{result.matchedKeyType || 'RSA'}</div>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                    <div className="text-slate-500 text-[11px]">Algorithm (alg)</div>
                    <div className="font-bold text-slate-200">{result.matchedAlg || 'RS256'}</div>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                    <div className="text-slate-500 text-[11px]">Intended Use (use)</div>
                    <div className="font-bold text-slate-200">
                      {result.matchedKeyUse === 'sig' ? 'sig (Signature)' : result.matchedKeyUse || 'sig'}
                    </div>
                  </div>
                </div>

                {result.jwksUri && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="truncate mr-2">
                      <span>JWKS URI: </span>
                      <span className="text-slate-400">{result.jwksUri}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(result.jwksUri || '')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition-colors"
                      title={copied ? 'Copied JWKS URI' : 'Copy JWKS URI'}
                      aria-label="Copy JWKS URI"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
