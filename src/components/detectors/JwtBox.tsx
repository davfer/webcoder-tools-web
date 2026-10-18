import React, { useState } from 'react';
import { JwtAnalysis } from '../../utils/jwtEngine';
import { Copy, Check, Maximize2, Minimize2, KeyRound, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  analysis: JwtAnalysis;
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const JwtBox: React.FC<Props> = ({
  analysis,
  rawInput,
  isFocused,
  onToggleFocus,
}) => {
  const [copiedSection, setCopiedSection] = useState<'all' | 'payload' | 'header' | null>(null);

  const handleCopy = (text: string, section: 'all' | 'payload' | 'header') => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-violet-500 shadow-xl shadow-violet-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400" />
          <span className="text-sm font-semibold text-slate-100">JWT / JWKS Token Inspector</span>
          <span className="text-xs px-2 py-0.5 rounded bg-violet-950/60 border border-violet-800/40 text-violet-300 font-mono">
            {analysis.algorithm}
          </span>
          {analysis.keyId && (
            <span className="text-xs text-slate-400 font-mono">kid: {analysis.keyId}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Expiration status badge */}
          {analysis.expirationStatus === 'valid' && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{analysis.timeRemaining}</span>
            </span>
          )}
          {analysis.expirationStatus === 'expired' && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50 text-rose-300 font-mono">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{analysis.timeRemaining}</span>
            </span>
          )}

          <button
            onClick={() => handleCopy(analysis.formattedPayload, 'payload')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors"
          >
            {copiedSection === 'payload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Payload</span>
          </button>

          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-violet-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus JWT Tool'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Token Color-Coded Segments */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#0B0F17] rounded-lg border border-slate-800 text-xs font-mono break-all">
          <span className="text-cyan-400 font-semibold">HEADER</span>
          <span className="text-slate-600">.</span>
          <span className="text-violet-400 font-semibold">PAYLOAD</span>
          <span className="text-slate-600">.</span>
          <span className="text-amber-400 font-semibold">SIGNATURE</span>
        </div>

        {/* Claims Table */}
        {analysis.claims.length > 0 && (
          <div>
            <div className="text-xs font-mono text-slate-400 mb-2">DECODED CLAIMS & METADATA:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.claims.map((claim) => (
                <div
                  key={claim.name}
                  className="p-2.5 bg-[#0B0F17] rounded-lg border border-slate-800/80 text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-semibold text-violet-300">{claim.name}</span>
                    <span className="text-slate-500">{claim.description}</span>
                  </div>
                  <div className={`truncate ${claim.isExpired ? 'text-rose-400 font-medium' : 'text-slate-200'}`}>
                    {claim.humanValue || String(claim.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dual Pre: Header & Payload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1">
              <span>HEADER (JOSE)</span>
              <button
                onClick={() => handleCopy(analysis.formattedHeader, 'header')}
                className="hover:text-cyan-200"
              >
                {copiedSection === 'header' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 bg-[#0B0F17] rounded-lg border border-slate-800/90 text-xs font-mono text-cyan-300 overflow-x-auto max-h-48 whitespace-pre">
              {analysis.formattedHeader}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-mono text-violet-400 mb-1">
              <span>PAYLOAD (CLAIMS)</span>
              <button
                onClick={() => handleCopy(analysis.formattedPayload, 'payload')}
                className="hover:text-violet-200"
              >
                {copiedSection === 'payload' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 bg-[#0B0F17] rounded-lg border border-slate-800/90 text-xs font-mono text-violet-300 overflow-x-auto max-h-48 whitespace-pre">
              {analysis.formattedPayload}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
