import React, { useState } from 'react';
import { IpAnalysis } from '../../utils/ipEngine';
import { Copy, Check, Maximize2, Minimize2, MapPin } from 'lucide-react';

interface Props {
  analysis: IpAnalysis;
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const IpBox: React.FC<Props> = ({
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
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-teal-500 shadow-xl shadow-teal-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-400" />
          <span className="text-sm font-semibold text-slate-100">IP & Subnet Calculator</span>
          <span className="text-xs px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/50 text-teal-300 font-mono">
            IPv{analysis.version} {analysis.isCidr ? `CIDR /${analysis.cidrPrefix}` : 'Single Host'}
          </span>
          <span className="text-xs text-slate-400 font-mono">· {analysis.ipType}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-teal-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus IP Tool'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {analysis.version === 4 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
              <div className="text-slate-500">Network Address</div>
              <div className="text-teal-300 font-semibold">{analysis.networkAddress}</div>
            </div>
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
              <div className="text-slate-500">Broadcast Address</div>
              <div className="text-teal-300 font-semibold">{analysis.broadcastAddress}</div>
            </div>
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
              <div className="text-slate-500">Subnet Mask</div>
              <div className="text-slate-200 font-semibold">{analysis.netmask}</div>
            </div>
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
              <div className="text-slate-500">Wildcard Mask</div>
              <div className="text-slate-200 font-semibold">{analysis.wildcard}</div>
            </div>
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
              <div className="text-slate-500">Usable Host Range</div>
              <div className="text-slate-200 font-semibold truncate">
                {analysis.firstUsableIp} - {analysis.lastUsableIp}
              </div>
            </div>
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
              <div className="text-slate-500">Usable Hosts</div>
              <div className="text-emerald-400 font-semibold">{analysis.usableHosts?.toLocaleString()}</div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#0B0F17] rounded border border-slate-800 font-mono text-xs text-teal-300">
            {analysis.ip}
          </div>
        )}

        {analysis.binaryRepresentation && (
          <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 text-xs font-mono space-y-1">
            <div className="text-slate-500">Binary Bitmask:</div>
            <div className="text-teal-400 break-all">{analysis.binaryRepresentation}</div>
          </div>
        )}
      </div>
    </div>
  );
};
