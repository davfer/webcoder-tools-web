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
            onClick={() => handleCopy('main', analysis.isCidr ? `${analysis.networkAddress}/${analysis.cidrPrefix}` : analysis.ip)}
            className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={copiedKey === 'main' ? 'Copied IP' : 'Copy IP address'}
            aria-label="Copy IP address"
          >
            {copiedKey === 'main' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

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
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-500">Network Address</div>
                <div className="text-teal-300 font-semibold">{analysis.networkAddress}</div>
              </div>
              <button
                onClick={() => handleCopy('network', analysis.networkAddress)}
                className="p-1 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-800/60 transition-colors shrink-0"
                title={copiedKey === 'network' ? 'Copied' : 'Copy Network Address'}
                aria-label="Copy Network Address"
              >
                {copiedKey === 'network' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-500">Broadcast Address</div>
                <div className="text-teal-300 font-semibold">{analysis.broadcastAddress}</div>
              </div>
              <button
                onClick={() => handleCopy('broadcast', analysis.broadcastAddress)}
                className="p-1 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-800/60 transition-colors shrink-0"
                title={copiedKey === 'broadcast' ? 'Copied' : 'Copy Broadcast Address'}
                aria-label="Copy Broadcast Address"
              >
                {copiedKey === 'broadcast' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-500">Subnet Mask</div>
                <div className="text-slate-200 font-semibold">{analysis.netmask}</div>
              </div>
              <button
                onClick={() => handleCopy('netmask', analysis.netmask)}
                className="p-1 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-800/60 transition-colors shrink-0"
                title={copiedKey === 'netmask' ? 'Copied' : 'Copy Subnet Mask'}
                aria-label="Copy Subnet Mask"
              >
                {copiedKey === 'netmask' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-500">Wildcard Mask</div>
                <div className="text-slate-200 font-semibold">{analysis.wildcard}</div>
              </div>
              <button
                onClick={() => handleCopy('wildcard', analysis.wildcard)}
                className="p-1 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-800/60 transition-colors shrink-0"
                title={copiedKey === 'wildcard' ? 'Copied' : 'Copy Wildcard Mask'}
                aria-label="Copy Wildcard Mask"
              >
                {copiedKey === 'wildcard' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 flex items-center justify-between">
              <div className="truncate mr-1">
                <div className="text-slate-500">Usable Host Range</div>
                <div className="text-slate-200 font-semibold truncate">
                  {analysis.firstUsableIp} - {analysis.lastUsableIp}
                </div>
              </div>
              <button
                onClick={() => handleCopy('range', `${analysis.firstUsableIp} - ${analysis.lastUsableIp}`)}
                className="p-1 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-800/60 transition-colors shrink-0"
                title={copiedKey === 'range' ? 'Copied' : 'Copy Usable Host Range'}
                aria-label="Copy Usable Host Range"
              >
                {copiedKey === 'range' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-500">Usable Hosts</div>
                <div className="text-emerald-400 font-semibold">{analysis.usableHosts?.toLocaleString()}</div>
              </div>
              <button
                onClick={() => handleCopy('hosts', String(analysis.usableHosts))}
                className="p-1 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-800/60 transition-colors shrink-0"
                title={copiedKey === 'hosts' ? 'Copied' : 'Copy Usable Hosts count'}
                aria-label="Copy Usable Hosts count"
              >
                {copiedKey === 'hosts' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#0B0F17] rounded border border-slate-800 font-mono text-xs text-teal-300 flex items-center justify-between">
            <span className="truncate mr-2">{analysis.ip}</span>
            <button
              onClick={() => handleCopy('ipv6', analysis.ip)}
              className="p-1 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-800 transition-colors shrink-0"
              title={copiedKey === 'ipv6' ? 'Copied' : 'Copy IPv6'}
              aria-label="Copy IPv6"
            >
              {copiedKey === 'ipv6' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {analysis.binaryRepresentation && (
          <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 text-xs font-mono flex items-start justify-between">
            <div className="space-y-1 overflow-hidden mr-2">
              <div className="text-slate-500">Binary Bitmask:</div>
              <div className="text-teal-400 break-all">{analysis.binaryRepresentation}</div>
            </div>
            <button
              onClick={() => handleCopy('binary', analysis.binaryRepresentation)}
              className="p-1 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-800 transition-colors shrink-0 mt-0.5"
              title={copiedKey === 'binary' ? 'Copied' : 'Copy Binary Bitmask'}
              aria-label="Copy Binary Bitmask"
            >
              {copiedKey === 'binary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
