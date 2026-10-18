import React, { useState, useEffect, useMemo } from 'react';
import { ToolCategory } from './types';
import { networkTracker } from './services/networkTracker';
import { defaultDetectorRegistry, DetectedBox } from './services/detectorRegistry';

import { analyzeJwt } from './utils/jwtEngine';
import { analyzeCertificate, CertAnalysis } from './utils/certsEngine';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { AllTheThingsInput } from './components/AllTheThingsInput';
import { NetworkDrawer } from './components/NetworkDrawer';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import { ArrowLeft, Sparkles } from 'lucide-react';

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

  // Pre-analyze JWT for contextual JWKS evaluation
  const jwtResult = useMemo(() => analyzeJwt(input), [input]);

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

  const hasInput = input.trim().length > 0;

  // Run the T -> []Boxes Detector Machine pipeline!
  const detectedBoxes: DetectedBox[] = useMemo(() => {
    return defaultDetectorRegistry.evaluate(input, {
      activeCategory,
      jwtResult,
      certAnalysis,
    });
  }, [input, activeCategory, jwtResult, certAnalysis]);

  // Detector matching map derived from evaluated boxes
  const matches: Record<ToolCategory, boolean> = useMemo(() => {
    const map: Record<ToolCategory, boolean> = {
      all: true,
      uri: false,
      jwt: false,
      jwks: false,
      json: false,
      hash: false,
      k8s: false,
      base64: false,
      hexdec: false,
      ip: false,
      certs: false,
      oidc: false,
    };
    if (!hasInput) return map;
    detectedBoxes.forEach((box) => {
      map[box.id] = true;
    });
    return map;
  }, [hasInput, detectedBoxes]);

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

  // Filter boxes according to active category, user toggle, and focus mode
  const visibleBoxes = useMemo(() => {
    return detectedBoxes.filter((box) => {
      if (!enabledDetectors[box.id]) return false;
      if (focusedTool) return focusedTool === box.id;
      if (activeCategory !== 'all') return activeCategory === box.id;
      return true;
    });
  }, [detectedBoxes, enabledDetectors, focusedTool, activeCategory]);

  const visibleCount = visibleBoxes.length;

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

          {/* Render Active Detector Cards (Dynamic T -> []Boxes Pipeline) */}
          <div className="space-y-4">
            {visibleBoxes.map((box) => (
              <div key={box.id}>
                {box.render({
                  input,
                  isFocused: focusedTool === box.id,
                  onToggleFocus: () => setFocusedTool(focusedTool === box.id ? null : box.id),
                  onUpdateInput: setInput,
                })}
              </div>
            ))}

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
