import React from 'react';
import { ToolCategory } from '../types';
import {
  Sparkles,
  Binary,
  Braces,
  KeyRound,
  Hash,
  Globe,
  Calculator,
  MapPin,
  Award,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface Props {
  activeCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
  matches: Record<ToolCategory, boolean>;
  enabledDetectors: Record<ToolCategory, boolean>;
  onToggleDetector: (category: ToolCategory) => void;
}

export const Sidebar: React.FC<Props> = ({
  activeCategory,
  onSelectCategory,
  matches,
  enabledDetectors,
  onToggleDetector,
}) => {
  const tools: { id: ToolCategory; label: string; icon: React.FC<any>; color: string }[] = [
    { id: 'uri', label: 'URI & Network', icon: Globe, color: 'text-sky-400' },
    { id: 'jwt', label: 'JWT Inspector', icon: KeyRound, color: 'text-violet-400' },
    { id: 'jwks', label: 'JWKS Validator', icon: ShieldCheck, color: 'text-purple-400' },
    { id: 'json', label: 'JSON Formatter', icon: Braces, color: 'text-emerald-400' },
    { id: 'hash', label: 'Hashes & CRC', icon: Hash, color: 'text-amber-400' },
    { id: 'k8s', label: 'K8s Manifests', icon: Layers, color: 'text-blue-400' },
    { id: 'base64', label: 'Base64 & Base32', icon: Binary, color: 'text-cyan-400' },
    { id: 'hexdec', label: 'HEX, DEC, BIN', icon: Calculator, color: 'text-indigo-400' },
    { id: 'ip', label: 'IP & Subnets', icon: MapPin, color: 'text-teal-400' },
    { id: 'certs', label: 'X.509 Certs', icon: Award, color: 'text-emerald-400' },
    { id: 'oidc', label: 'OAuth & OIDC', icon: ShieldCheck, color: 'text-pink-400' },
  ];

  const matchedCount = Object.values(matches).filter(Boolean).length;

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-slate-800/80 p-4 flex flex-col shrink-0">
      {/* Master Mode Switch */}
      <div className="mb-4">
        <button
          onClick={() => onSelectCategory('all')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 border border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AllTheThings Mode</span>
          </div>
          {matchedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
              {matchedCount}
            </span>
          )}
        </button>
      </div>

      {/* Function Focus / Toggles */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2 px-1">
        <span>FUNCTION FOCUS</span>
        <span>ON / OFF</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
        {tools.map((t) => {
          const Icon = t.icon;
          const isMatched = matches[t.id];
          const isSelected = activeCategory === t.id;
          const isEnabled = enabledDetectors[t.id] ?? true;

          return (
            <div
              key={t.id}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition-all group ${
                isSelected
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <button
                onClick={() => onSelectCategory(isSelected ? 'all' : t.id)}
                className="flex items-center gap-2.5 flex-1 text-left truncate mr-2"
                title={`Focus on ${t.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${t.color} shrink-0`} />
                <span className="truncate">{t.label}</span>
                {isMatched && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" title="Input matched this detector" />
                )}
              </button>

              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => onToggleDetector(t.id)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer opacity-70 group-hover:opacity-100"
                title={isEnabled ? `Disable ${t.label}` : `Enable ${t.label}`}
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
};
