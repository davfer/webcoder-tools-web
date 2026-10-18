import React, { useState } from 'react';
import { K8sAnalysis } from '../../utils/k8sEngine';
import { Copy, Check, Maximize2, Minimize2, Eye, EyeOff, Layers, KeyRound } from 'lucide-react';

interface Props {
  analysis: K8sAnalysis;
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const K8sBox: React.FC<Props> = ({
  analysis,
  rawInput,
  isFocused,
  onToggleFocus,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPlainSecrets, setShowPlainSecrets] = useState(false);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-sm font-semibold text-slate-100">Kubernetes Manifest & Secret Inspector</span>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/50 text-blue-300 font-mono">
            {analysis.resources.length} Resource{analysis.resources.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {analysis.resources.some((r) => r.isSecret) && (
            <button
              onClick={() => setShowPlainSecrets(!showPlainSecrets)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {showPlainSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPlainSecrets ? 'Mask Secrets' : 'Reveal Decoded Secrets'}</span>
            </button>
          )}

          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-blue-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus K8s Tool'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 font-mono text-xs">
        {analysis.resources.map((res, idx) => (
          <div key={idx} className="p-3 bg-[#0B0F17] rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded font-bold border border-blue-800/40">
                  {res.kind}
                </span>
                <span className="text-slate-100 font-semibold">{res.name}</span>
                {res.namespace && (
                  <span className="text-slate-500">ns: {res.namespace}</span>
                )}
              </div>
              <span className="text-slate-500">{res.apiVersion}</span>
            </div>

            {/* If Secret with Decoded Base64 entries */}
            {res.secretEntries && res.secretEntries.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-slate-400 font-semibold flex items-center justify-between">
                  <span>DECODED SECRET KEYS (AUTOMATIC BASE64 REVEAL):</span>
                  <span className="text-[11px] text-slate-500">{res.secretEntries.length} entries</span>
                </div>
                <div className="space-y-1.5">
                  {res.secretEntries.map((sec) => (
                    <div
                      key={sec.key}
                      className="flex items-center justify-between p-2 bg-slate-900/80 rounded border border-slate-800"
                    >
                      <div className="truncate mr-2">
                        <span className="text-blue-400 font-semibold mr-2">{sec.key}:</span>
                        <span className={`select-all ${showPlainSecrets ? 'text-emerald-300 font-semibold' : 'text-slate-500'}`}>
                          {showPlainSecrets ? sec.decodedValue : '••••••••••••••••'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(sec.key, showPlainSecrets ? sec.decodedValue : sec.base64Value)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 text-xs"
                      >
                        {copiedKey === sec.key ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
