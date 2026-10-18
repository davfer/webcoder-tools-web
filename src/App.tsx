import React, { useState, useEffect, useMemo } from 'react';
import { ToolCategory } from './types';
import { networkTracker } from './services/networkTracker';

import { analyzeBase64 } from './utils/base64Engine';
import { analyzeJson } from './utils/jsonEngine';
import { analyzeJwt } from './utils/jwtEngine';
import { analyzeUri } from './utils/uriEngine';
import { analyzeHexDec } from './utils/hexDecEngine';
import { analyzeIp } from './utils/ipEngine';
import { analyzeCertificate, CertAnalysis } from './utils/certsEngine';
import { analyzeK8s } from './utils/k8sEngine';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { AllTheThingsInput } from './components/AllTheThingsInput';
import { NetworkDrawer } from './components/NetworkDrawer';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import { Base64Box } from './components/detectors/Base64Box';
import { JsonBox } from './components/detectors/JsonBox';
import { JwtBox } from './components/detectors/JwtBox';
import { HashBox } from './components/detectors/HashBox';
import { UriBox } from './components/detectors/UriBox';
import { HexDecBox } from './components/detectors/HexDecBox';
import { IpBox } from './components/detectors/IpBox';
import { CertsBox } from './components/detectors/CertsBox';
import { K8sBox } from './components/detectors/K8sBox';
import { OidcBox } from './components/detectors/OidcBox';
import { JwksBox } from './components/detectors/JwksBox';

import { ArrowLeft, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [input, setInput] = useState<string>(() => {
    try {
      return localStorage.getItem('webcoder_input_stream') || '';
    } catch {
      return '';
    }
  });

  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [focusedTool, setFocusedTool] = useState<ToolCategory | null>(null);
  const [isNetworkDrawerOpen, setIsNetworkDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [networkCount, setNetworkCount] = useState(networkTracker.getCount());

  const [enabledDetectors, setEnabledDetectors] = useState<Record<ToolCategory, boolean>>({
    all: true,
    base64: true,
    json: true,
    jwt: true,
    jwks: true,
    hash: true,
    uri: true,
    hexdec: true,
    ip: true,
    certs: true,
    k8s: true,
    oidc: true,
  });

  const [certAnalysis, setCertAnalysis] = useState<CertAnalysis>({
    isCert: false,
    type: 'none',
    subject: '',
    issuer: '',
    commonName: '',
    rawPem: '',
  });

  // Track network calls
  useEffect(() => {
    const unsub = networkTracker.subscribe(() => {
      setNetworkCount(networkTracker.getCount());
    });
    return unsub;
  }, []);

  // Save input to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('webcoder_input_stream', input);
    } catch {}
  }, [input]);

  // Run analytical engines
  const base64Result = useMemo(() => analyzeBase64(input), [input]);
  const jsonResult = useMemo(() => analyzeJson(input), [input]);
  const jwtResult = useMemo(() => analyzeJwt(input), [input]);
  const uriResult = useMemo(() => analyzeUri(input), [input]);
  const hexDecResult = useMemo(() => analyzeHexDec(input), [input]);
  const ipResult = useMemo(() => analyzeIp(input), [input]);
  const k8sResult = useMemo(() => analyzeK8s(input), [input]);

  useEffect(() => {
    let cancelled = false;
    analyzeCertificate(input).then((res) => {
      if (!cancelled) {
        setCertAnalysis(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  // Detector matching map (only match when input is present)
  const hasInput = input.trim().length > 0;
  const matches: Record<ToolCategory, boolean> = {
    all: true,
    uri: hasInput && uriResult.isUri,
    jwt: hasInput && jwtResult.isJwt,
    jwks: hasInput && ((jwtResult.isJwt && !!jwtResult.payload?.iss) || input.toLowerCase().includes('jwks')),
    json: hasInput && jsonResult.isValidJson,
    hash: hasInput,
    k8s: hasInput && k8sResult.isK8s,
    base64: hasInput && base64Result.isBase64,
    hexdec: hasInput && hexDecResult.isConvertible,
    ip: hasInput && ipResult.isIp,
    certs: hasInput && certAnalysis.isCert,
    oidc: activeCategory === 'oidc' || (hasInput && (jwtResult.isJwt || input.toLowerCase().includes('oauth'))),
  };

  const handleToggleDetector = (cat: ToolCategory) => {
    setEnabledDetectors((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const handleClearStorage = () => {
    localStorage.removeItem('webcoder_input_stream');
    networkTracker.clear();
    setInput('');
  };

  const isToolVisible = (toolId: ToolCategory): boolean => {
    if (!enabledDetectors[toolId]) return false;
    if (focusedTool) return focusedTool === toolId;
    if (activeCategory !== 'all') return activeCategory === toolId;
    return matches[toolId];
  };

  const visibleCount = [
    'uri',
    'jwt',
    'jwks',
    'json',
    'hash',
    'k8s',
    'base64',
    'hexdec',
    'ip',
    'certs',
    'oidc',
  ].filter((id) => isToolVisible(id as ToolCategory)).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F17] text-slate-100">
      {/* Top Header */}
      <Header />

      {/* Main Workspace with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Function Focus & Toggles Sidebar */}
        <Sidebar
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setFocusedTool(null);
          }}
          matches={matches}
          enabledDetectors={enabledDetectors}
          onToggleDetector={handleToggleDetector}
        />

        {/* Center Canvas */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5 max-w-7xl mx-auto w-full">
          {/* Focus mode breadcrumb banner */}
          {focusedTool && (
            <div className="flex items-center justify-between p-3 bg-[#161F30] border border-cyan-500/40 rounded-xl font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-cyan-400">FOCUS MODE ACTIVE:</span>
                <span className="text-slate-300 capitalize">{focusedTool} Tool Isolated</span>
              </div>
              <button
                onClick={() => setFocusedTool(null)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Focus Mode</span>
              </button>
            </div>
          )}

          {/* Primary AllTheThings Textarea */}
          <AllTheThingsInput
            value={input}
            onChange={setInput}
            onClear={() => setInput('')}
          />

          {/* Detection summary bar - only shown when input is present */}
          {hasInput && (
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">DETECTED PAYLOADS:</span>
                <span className="text-cyan-400 font-semibold">{visibleCount} tool cards active</span>
                {activeCategory !== 'all' && (
                  <span className="text-slate-500">· Filtered to {activeCategory.toUpperCase()}</span>
                )}
              </div>
            </div>
          )}

          {/* Render Active Detector Cards */}
          <div className="space-y-4">
            {/* URI Box (Prompt requirement: If contains query string, set on top this section) */}
            {isToolVisible('uri') && (
              <UriBox
                analysis={uriResult}
                rawInput={input}
                isFocused={focusedTool === 'uri'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'uri' ? null : 'uri')}
                onUpdateInput={setInput}
              />
            )}

            {/* JWT Inspector */}
            {isToolVisible('jwt') && (
              <JwtBox
                analysis={jwtResult}
                rawInput={input}
                isFocused={focusedTool === 'jwt'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'jwt' ? null : 'jwt')}
                onUpdateInput={setInput}
              />
            )}

            {/* JWKS Public Key & Signature Validator Box */}
            {isToolVisible('jwks') && (
              <JwksBox
                jwtString={input}
                issuerClaim={jwtResult.payload?.iss}
                tokenKid={jwtResult.header?.kid}
                tokenAlg={jwtResult.header?.alg}
                isFocused={focusedTool === 'jwks'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'jwks' ? null : 'jwks')}
              />
            )}

            {/* JSON Box */}
            {isToolVisible('json') && (
              <JsonBox
                analysis={jsonResult}
                rawInput={input}
                isFocused={focusedTool === 'json'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'json' ? null : 'json')}
                onUpdateInput={setInput}
              />
            )}

            {/* Kubernetes Resources */}
            {isToolVisible('k8s') && (
              <K8sBox
                analysis={k8sResult}
                rawInput={input}
                isFocused={focusedTool === 'k8s'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'k8s' ? null : 'k8s')}
                onUpdateInput={setInput}
              />
            )}

            {/* X.509 Certificates */}
            {isToolVisible('certs') && (
              <CertsBox
                analysis={certAnalysis}
                rawInput={input}
                isFocused={focusedTool === 'certs'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'certs' ? null : 'certs')}
                onUpdateInput={setInput}
              />
            )}

            {/* Base64 & Base32 */}
            {isToolVisible('base64') && (
              <Base64Box
                analysis={base64Result}
                rawInput={input}
                isFocused={focusedTool === 'base64'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'base64' ? null : 'base64')}
                onUpdateInput={setInput}
              />
            )}

            {/* Hash Tools: CRC, MD5, SHA1, Detector, Password */}
            {isToolVisible('hash') && (
              <HashBox
                rawInput={input}
                isFocused={focusedTool === 'hash'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'hash' ? null : 'hash')}
                onUpdateInput={setInput}
              />
            )}

            {/* Hex, Dec, Bin, ASCII */}
            {isToolVisible('hexdec') && (
              <HexDecBox
                analysis={hexDecResult}
                rawInput={input}
                isFocused={focusedTool === 'hexdec'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'hexdec' ? null : 'hexdec')}
                onUpdateInput={setInput}
              />
            )}

            {/* IP & CIDR Subnets */}
            {isToolVisible('ip') && (
              <IpBox
                analysis={ipResult}
                rawInput={input}
                isFocused={focusedTool === 'ip'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'ip' ? null : 'ip')}
                onUpdateInput={setInput}
              />
            )}

            {/* OAuth 2.0 / OIDC Testing Playground */}
            {isToolVisible('oidc') && (
              <OidcBox
                rawInput={input}
                isFocused={focusedTool === 'oidc'}
                onToggleFocus={() => setFocusedTool(focusedTool === 'oidc' ? null : 'oidc')}
                onUpdateInput={setInput}
              />
            )}

            {/* Unmatched state - only displayed when input was provided but nothing matched */}
            {hasInput && visibleCount === 0 && (
              <div className="p-8 text-center bg-[#111827] border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                <Sparkles className="w-5 h-5 text-slate-500 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-300">
                  No automated detectors matched current input
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Paste a JWT token, an API URL with parameters, a Kubernetes Secret, an X.509 PEM certificate, a Base64 string, or hash into the textarea above.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Status Bar / Footer */}
      <Footer
        networkCallCount={networkCount}
        onOpenNetwork={() => setIsNetworkDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Slide-over Network Calls Audit Drawer */}
      <NetworkDrawer
        isOpen={isNetworkDrawerOpen}
        onClose={() => setIsNetworkDrawerOpen(false)}
      />

      {/* Workbench Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        enabledDetectors={enabledDetectors}
        onToggleDetector={handleToggleDetector}
        onClearStorage={handleClearStorage}
      />

      {/* PWA Offline Mode Indicator */}
      <OfflineIndicator />
    </div>
  );
}
