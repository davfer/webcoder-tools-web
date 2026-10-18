import React, { useState, useEffect } from 'react';
import {
  generatePkcePair,
  generateRandomString,
  buildAuthorizeUrl,
  generateMockOidcTokens,
  PkcePair,
} from '../../utils/oidcEngine';
import { Copy, Check, Maximize2, Minimize2, Key, RefreshCw, Send, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const OidcBox: React.FC<Props> = ({
  rawInput,
  isFocused,
  onToggleFocus,
  onUpdateInput,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pkce, setPkce] = useState<PkcePair | null>(null);
  const [stateVal, setStateVal] = useState('');
  const [nonceVal, setNonceVal] = useState('');

  // Auth builder inputs
  const [issuer, setIssuer] = useState('https://auth.webcoder.tools');
  const [clientId, setClientId] = useState('webcoder-app-client');
  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/callback');
  const [scope, setScope] = useState('openid profile email');

  // Generated mock tokens
  const [mockTokens, setMockTokens] = useState<any>(null);

  const refreshCredentials = async () => {
    const pair = await generatePkcePair(64);
    setPkce(pair);
    setStateVal(generateRandomString(24));
    setNonceVal(generateRandomString(24));
  };

  useEffect(() => {
    refreshCredentials();
  }, []);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const authUrl = pkce
    ? buildAuthorizeUrl({
        authEndpoint: `${issuer}/oauth2/v1/authorize`,
        clientId,
        redirectUri,
        scope,
        responseType: 'code',
        state: stateVal,
        nonce: nonceVal,
        codeChallenge: pkce.challenge,
      })
    : '';

  const handleGenerateMockTokens = () => {
    const tokens = generateMockOidcTokens({
      sub: 'usr_dev_' + Math.random().toString(36).substring(2, 8),
      name: 'Local Developer',
      email: 'dev@webcoder.tools',
      issuer,
      clientId,
    });
    setMockTokens(tokens);
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-pink-500 shadow-xl shadow-pink-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400" />
          <span className="text-sm font-semibold text-slate-100">OAuth 2.0 / OIDC Testing Playground</span>
          <span className="text-xs px-2 py-0.5 rounded bg-pink-950/60 border border-pink-800/50 text-pink-300 font-mono">
            PKCE S256 Ready
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshCredentials}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Generate new PKCE and State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>

          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-pink-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus OIDC Tool'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 font-mono text-xs">
        {/* PKCE & Security Nonces */}
        {pkce && (
          <div className="space-y-2">
            <div className="text-slate-400 font-semibold">PKCE RFC 7636 PARAMETERS:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>code_verifier (Raw Entropy)</span>
                  <button
                    onClick={() => handleCopy('verifier', pkce.verifier)}
                    className="hover:text-pink-300"
                  >
                    {copiedKey === 'verifier' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-pink-300 font-semibold truncate select-all">{pkce.verifier}</div>
              </div>

              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>code_challenge (SHA-256 Base64URL)</span>
                  <button
                    onClick={() => handleCopy('challenge', pkce.challenge)}
                    className="hover:text-pink-300"
                  >
                    {copiedKey === 'challenge' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-emerald-300 font-semibold truncate select-all">{pkce.challenge}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>state (CSRF Token)</span>
                  <button
                    onClick={() => handleCopy('state', stateVal)}
                    className="hover:text-pink-300"
                  >
                    {copiedKey === 'state' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-slate-300 truncate select-all">{stateVal}</div>
              </div>

              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>nonce (Replay Token Binding)</span>
                  <button
                    onClick={() => handleCopy('nonce', nonceVal)}
                    className="hover:text-pink-300"
                  >
                    {copiedKey === 'nonce' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-slate-300 truncate select-all">{nonceVal}</div>
              </div>
            </div>
          </div>
        )}

        {/* Live Authorize URL Builder */}
        <div className="p-3 bg-[#0B0F17] rounded border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-pink-400 font-semibold">
            <span>COMPILED OIDC AUTHORIZATION REQUEST URL:</span>
            <button
              onClick={() => handleCopy('authUrl', authUrl)}
              className="text-slate-400 hover:text-white"
            >
              {copiedKey === 'authUrl' ? 'Copied URL!' : 'Copy URL'}
            </button>
          </div>
          <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-slate-300 break-all select-all">
            {authUrl}
          </div>
        </div>

        {/* Mock OIDC Tokens Generator */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">LOCAL OIDC TOKEN SIMULATOR:</span>
            <button
              onClick={handleGenerateMockTokens}
              className="px-2.5 py-1 rounded bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 border border-pink-500/40"
            >
              Simulate Token Issuance
            </button>
          </div>

          {mockTokens && (
            <div className="space-y-2">
              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Issued id_token (JWT):</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateInput(mockTokens.idToken)}
                      className="text-pink-400 hover:underline"
                    >
                      Inspect in AllTheThings
                    </button>
                    <button
                      onClick={() => handleCopy('idToken', mockTokens.idToken)}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'idToken' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="text-violet-300 truncate select-all">{mockTokens.idToken}</div>
              </div>

              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>access_token (Bearer):</span>
                  <button
                    onClick={() => handleCopy('accessToken', mockTokens.accessToken)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'accessToken' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-slate-300 truncate select-all">{mockTokens.accessToken}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
