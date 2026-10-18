import React, { useState } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { SAMPLE_PRESETS } from '../utils/presets';
import { PresetPayload, ToolCategory } from '../types';
import { Terminal, User, ChevronDown, Sparkles, Sliders, Activity } from 'lucide-react';

interface Props {
  activeTab: ToolCategory;
  onSelectTab: (tab: ToolCategory) => void;
  onLoadPreset: (preset: PresetPayload) => void;
  onOpenSettings: () => void;
  onOpenNetwork: () => void;
  networkCallCount: number;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onLoadPreset,
  onOpenSettings,
  onOpenNetwork,
  networkCallCount,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [userRole, setUserRole] = useState<'developer' | 'secops' | 'guest'>('developer');

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-6 px-6 py-3 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single Wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
          <Terminal className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          WebCoder Tools
        </span>
        <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500">
          webcoder.tools
        </span>
      </div>

      {/* Zone 2: Nav Links / Modes */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('all')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'all' ? 'text-cyan-400 font-bold' : ''
          }`}
        >
          AllTheThings Mode
        </button>
        <button
          onClick={() => onSelectTab('uri')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'uri' ? 'text-cyan-400 font-bold' : ''
          }`}
        >
          URI & Network
        </button>
        <button
          onClick={() => onSelectTab('oidc')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'oidc' ? 'text-cyan-400 font-bold' : ''
          }`}
        >
          Identity & OIDC
        </button>
        <button
          onClick={() => onSelectTab('hash')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'hash' ? 'text-cyan-400 font-bold' : ''
          }`}
        >
          Crypto & Hashes
        </button>
        <button
          onClick={() => onSelectTab('k8s')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'k8s' ? 'text-cyan-400 font-bold' : ''
          }`}
        >
          K8s & Cloud
        </button>
      </nav>

      {/* Zone 3: Primary Action & Context */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Presets dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-[#111827] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sample Presets</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showPresetsMenu && (
            <div className="absolute right-0 mt-1 w-64 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 font-mono text-xs">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/80">
                Load Test Payload
              </div>
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    onLoadPreset(p);
                    setShowPresetsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800/80 text-slate-300 hover:text-cyan-300 transition-colors flex flex-col"
                >
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <span className="text-[11px] text-slate-500 truncate">{p.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* User / Dev Profile button */}
        <div
          onClick={() => setUserRole(userRole === 'developer' ? 'secops' : 'developer')}
          className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Click to toggle developer / SecOps mode"
        >
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span className="capitalize">{userRole}</span>
        </div>
      </div>
    </header>
  );
};
