import React, { useState } from 'react';
import { CertAnalysis } from '../../utils/certsEngine';
import { Copy, Check, Maximize2, Minimize2, Award, ShieldAlert, ShieldCheck } from 'lucide-react';

interface Props {
  analysis: CertAnalysis;
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const CertsBox: React.FC<Props> = ({
  analysis,
  rawInput,
  isFocused,
  onToggleFocus,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, val?: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-emerald-500 shadow-xl shadow-emerald-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold text-slate-100">X.509 Certificate Inspector</span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-mono">
            {analysis.commonName}
          </span>
          {analysis.daysRemaining !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded font-mono border ${
              analysis.isExpired
                ? 'bg-rose-950/60 border-rose-800/50 text-rose-300'
                : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300'
            }`}>
              {analysis.isExpired ? 'Expired' : `${analysis.daysRemaining} days remaining`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-emerald-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus Certificate Tool'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3.5 text-xs font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
            <div className="text-slate-500 mb-1">Subject</div>
            <div className="text-emerald-300 font-semibold">{analysis.subject}</div>
          </div>
          <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
            <div className="text-slate-500 mb-1">Issuer (Certificate Authority)</div>
            <div className="text-slate-200 font-semibold">{analysis.issuer}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
            <div className="text-slate-500">Valid From</div>
            <div className="text-slate-200">{analysis.validFrom || 'N/A'}</div>
          </div>
          <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
            <div className="text-slate-500">Valid Until</div>
            <div className="text-slate-200">{analysis.validTo || 'N/A'}</div>
          </div>
          <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
            <div className="text-slate-500">Key Spec</div>
            <div className="text-slate-200">{analysis.keyType || 'RSA 2048'}</div>
          </div>
          <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
            <div className="text-slate-500">Serial Number</div>
            <div className="text-slate-200 truncate">{analysis.serialNumber || 'N/A'}</div>
          </div>
        </div>

        {analysis.sha256Fingerprint && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between p-2 bg-[#0B0F17] rounded border border-slate-800">
              <div className="truncate mr-2">
                <span className="text-slate-500 mr-2">SHA-256:</span>
                <span className="text-emerald-400 select-all">{analysis.sha256Fingerprint}</span>
              </div>
              <button
                onClick={() => handleCopy('sha256', analysis.sha256Fingerprint)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs shrink-0"
              >
                {copiedKey === 'sha256' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#0B0F17] rounded border border-slate-800">
              <div className="truncate mr-2">
                <span className="text-slate-500 mr-2">SHA-1:</span>
                <span className="text-slate-300 select-all">{analysis.sha1Fingerprint}</span>
              </div>
              <button
                onClick={() => handleCopy('sha1', analysis.sha1Fingerprint)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs shrink-0"
              >
                {copiedKey === 'sha1' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
