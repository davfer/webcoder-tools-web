import React, { useState } from 'react';
import { HexDecAnalysis } from '../../utils/hexDecEngine';
import { Copy, Check, Maximize2, Minimize2, Binary } from 'lucide-react';

interface Props {
  analysis: HexDecAnalysis;
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const HexDecBox: React.FC<Props> = ({
  analysis,
  rawInput,
  isFocused,
  onToggleFocus,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const fields = [
    { label: 'HEXADECIMAL', value: analysis.hex, key: 'hex' },
    { label: 'DECIMAL', value: analysis.decimal, key: 'dec' },
    { label: 'BINARY', value: analysis.binary, key: 'bin' },
    { label: 'OCTAL', value: analysis.octal, key: 'oct' },
    { label: 'ASCII / UTF-8', value: analysis.ascii, key: 'ascii' },
  ];

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-indigo-500 shadow-xl shadow-indigo-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-sm font-semibold text-slate-100">Hex / Dec / Bin Converter</span>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 font-mono">
            {analysis.detectedType.toUpperCase()} DETECTED
          </span>
          <span className="text-xs text-slate-400 font-mono">· {analysis.byteCount} bytes</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus Base Converter'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2.5 font-mono text-xs">
        {fields.map((f) => (
          <div
            key={f.key}
            className="flex items-center justify-between p-2.5 bg-[#0B0F17] rounded-lg border border-slate-800/90 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="w-28 font-semibold text-indigo-400 shrink-0">{f.label}</span>
              <span className="text-slate-300 truncate select-all">{f.value || '[None]'}</span>
            </div>
            <button
              onClick={() => handleCopy(f.key, f.value)}
              disabled={!f.value}
              className="flex items-center gap-1 ml-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 text-xs disabled:opacity-30"
            >
              {copiedKey === f.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === f.key ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
