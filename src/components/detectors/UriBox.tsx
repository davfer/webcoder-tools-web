import React, { useState } from 'react';
import {
  UriAnalysis,
  QueryParam,
  pingAndInspectUri,
  resolveDnsOverHttps,
  generateHopsForHost,
  PingTimingResult,
  DnsRecordResult,
  TracerouteHop,
} from '../../utils/uriEngine';
import {
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Globe,
  Radio,
  Plus,
  Trash2,
  Shield,
  Clock,
  Network,
  RotateCw,
  ExternalLink,
} from 'lucide-react';

interface Props {
  analysis: UriAnalysis;
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const UriBox: React.FC<Props> = ({
  analysis,
  rawInput,
  isFocused,
  onToggleFocus,
  onUpdateInput,
}) => {
  const [copied, setCopied] = useState(false);
  const [params, setParams] = useState<QueryParam[]>(analysis.queryParams);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [decodeToggle, setDecodeToggle] = useState(true);

  // Network probe states
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<PingTimingResult | null>(null);
  const [dnsResult, setDnsResult] = useState<DnsRecordResult | null>(null);
  const [hops, setHops] = useState<TracerouteHop[] | null>(null);

  // Keep local params in sync if analysis changes externally
  React.useEffect(() => {
    setParams(analysis.queryParams);
  }, [analysis.queryString]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const updateParam = (index: number, key: string, value: string) => {
    const updated = [...params];
    updated[index] = {
      key,
      value,
      decodedKey: key,
      decodedValue: value,
    };
    setParams(updated);
    rebuildUrl(updated);
  };

  const removeParam = (index: number) => {
    const updated = params.filter((_, i) => i !== index);
    setParams(updated);
    rebuildUrl(updated);
  };

  const addParam = () => {
    if (!newKey.trim()) return;
    const updated = [
      ...params,
      {
        key: newKey.trim(),
        value: newVal.trim(),
        decodedKey: newKey.trim(),
        decodedValue: newVal.trim(),
      },
    ];
    setParams(updated);
    setNewKey('');
    setNewVal('');
    rebuildUrl(updated);
  };

  const rebuildUrl = (currentParams: QueryParam[]) => {
    try {
      const url = new URL(analysis.raw.startsWith('http') ? analysis.raw : 'https://' + analysis.raw);
      url.search = '';
      currentParams.forEach((p) => {
        if (p.key) {
          url.searchParams.append(p.key, p.value);
        }
      });
      onUpdateInput(url.toString());
    } catch {}
  };

  const handlePingAndInspect = async () => {
    setIsProbing(true);
    try {
      const target = analysis.raw.startsWith('http') ? analysis.raw : 'https://' + analysis.raw;
      const timingRes = await pingAndInspectUri(target);
      setProbeResult(timingRes);

      const host = analysis.hostname || 'example.com';
      const dnsRes = await resolveDnsOverHttps(host);
      setDnsResult(dnsRes);

      const hopsRes = generateHopsForHost(host, dnsRes.ips[0] || '104.21.48.12');
      setHops(hopsRes);
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-sky-500 shadow-xl shadow-sky-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-400" />
          <span className="text-sm font-semibold text-slate-100">URI Dissector & Network Inspector</span>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/50 text-sky-300 font-mono">
            {analysis.protocol || 'https:'}
          </span>
          <span className="text-xs text-slate-400 font-mono truncate max-w-xs">{analysis.host}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePingAndInspect}
            disabled={isProbing}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            {isProbing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
            <span>{isProbing ? 'Probing...' : 'Ping & Inspect'}</span>
          </button>

          <button
            onClick={() => handleCopy(analysis.raw)}
            className="p-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors"
            title={copied ? 'Copied URL' : 'Copy URL'}
            aria-label="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-sky-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus URI Tool'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* REQUIREMENT: If contains query string, set ON TOP this section */}
        {analysis.hasQuery && (
          <div className="p-3.5 bg-[#0B0F17] rounded-xl border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-400 tracking-wide">
                  QUERY STRING PARAMETERS ({params.length})
                </span>
                <span className="text-xs text-slate-500 font-mono">· Priority Top View</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={decodeToggle}
                  onChange={(e) => setDecodeToggle(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500"
                />
                <span>URL-Decoded View</span>
              </label>
            </div>

            {/* Params Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-1.5 font-medium">KEY</th>
                    <th className="pb-1.5 font-medium">VALUE</th>
                    <th className="pb-1.5 text-right w-20">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {params.map((p, idx) => (
                    <tr key={idx} className="group hover:bg-slate-900/40">
                      <td className="py-1.5 pr-2 w-1/3">
                        <input
                          type="text"
                          value={decodeToggle ? p.decodedKey : p.key}
                          onChange={(e) => updateParam(idx, e.target.value, p.value)}
                          className="w-full bg-slate-900/70 border border-slate-800 rounded px-2 py-1 text-sky-300 font-semibold focus:outline-none focus:border-sky-500"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={decodeToggle ? p.decodedValue : p.value}
                          onChange={(e) => updateParam(idx, p.key, e.target.value)}
                          className="w-full bg-slate-900/70 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </td>
                      <td className="py-1.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleCopy(`${p.key}=${p.value}`)}
                          className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800/60 transition-colors mr-1"
                          title="Copy parameter"
                          aria-label="Copy parameter"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeParam(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Remove Parameter"
                          aria-label="Remove Parameter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Param Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <input
                type="text"
                placeholder="New key..."
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-1/3 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="New value..."
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={addParam}
                disabled={!newKey.trim()}
                className="flex items-center gap-1 px-2.5 py-1 bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 rounded text-xs font-mono disabled:opacity-40 whitespace-nowrap"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}

        {/* Dissected Parts Grid */}
        <div>
          <div className="text-xs font-mono text-slate-400 mb-2">DISSECTED URI COMPONENTS:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
              <div className="text-slate-500">Scheme</div>
              <div className="text-sky-300 font-semibold">{analysis.protocol || 'none'}</div>
            </div>
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 flex items-center justify-between">
              <div className="truncate mr-1">
                <div className="text-slate-500">Host & Port</div>
                <div className="text-slate-200 font-semibold truncate">{analysis.host}:{analysis.port}</div>
              </div>
              <button
                onClick={() => handleCopy(`${analysis.host}:${analysis.port}`)}
                className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition-colors shrink-0"
                title="Copy Host:Port"
                aria-label="Copy Host:Port"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800 flex items-center justify-between">
              <div className="truncate mr-1">
                <div className="text-slate-500">Pathname</div>
                <div className="text-slate-200 font-semibold truncate">{analysis.pathname || '/'}</div>
              </div>
              <button
                onClick={() => handleCopy(analysis.pathname || '/')}
                className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition-colors shrink-0"
                title="Copy Pathname"
                aria-label="Copy Pathname"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
              <div className="text-slate-500">Fragment (Hash)</div>
              <div className="text-slate-200 font-semibold truncate">{analysis.hash || 'none'}</div>
            </div>
          </div>
        </div>

        {/* Network & Diagnostics: CORS, HTTPS, Timings, Hops, Reverse, IP */}
        {probeResult && (
          <div className="p-4 bg-[#0B0F17] rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <Network className="w-4 h-4" />
                <span>LIVE DIAGNOSTICS & TELEMETRY</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                HTTP {probeResult.status} ({probeResult.totalDurationMs} ms)
              </span>
            </div>

            {/* Timings breakdown bar */}
            <div>
              <div className="text-xs font-mono text-slate-400 mb-1.5">TIMINGS BREAKDOWN:</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                  <div className="text-slate-500">DNS Lookup</div>
                  <div className="text-sky-300 font-semibold">{probeResult.dnsLookupMs} ms</div>
                </div>
                <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                  <div className="text-slate-500">TCP Connect</div>
                  <div className="text-cyan-300 font-semibold">{probeResult.connectMs} ms</div>
                </div>
                <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                  <div className="text-slate-500">TLS Handshake</div>
                  <div className="text-violet-300 font-semibold">{probeResult.tlsHandshakeMs} ms</div>
                </div>
                <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                  <div className="text-slate-500">TTFB (Server)</div>
                  <div className="text-amber-300 font-semibold">{probeResult.ttfbMs} ms</div>
                </div>
                <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                  <div className="text-slate-500">Total Duration</div>
                  <div className="text-emerald-300 font-semibold">{probeResult.totalDurationMs} ms</div>
                </div>
              </div>
            </div>

            {/* CORS & HTTPS Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800 space-y-1.5">
                <div className="font-semibold text-sky-400">CORS HEADERS EVALUATION</div>
                <div className="text-slate-300">
                  Allow-Origin: <span className="text-emerald-300">{probeResult.corsHeaders['access-control-allow-origin']}</span>
                </div>
                <div className="text-slate-300">
                  Allow-Methods: <span className="text-slate-400">{probeResult.corsHeaders['access-control-allow-methods']}</span>
                </div>
                <div className="text-slate-300">
                  Allow-Credentials: <span className="text-slate-400">{probeResult.corsHeaders['access-control-allow-credentials']}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded border border-slate-800 space-y-1.5">
                <div className="font-semibold text-emerald-400">HTTPS & SECURITY HEADERS</div>
                <div className="text-slate-300">
                  HSTS Strict-Transport: <span className={probeResult.securityHeaders.hsts ? 'text-emerald-400' : 'text-slate-500'}>{probeResult.securityHeaders.hsts ? 'Enforced' : 'Not configured'}</span>
                </div>
                <div className="text-slate-300">
                  Content-Security-Policy: <span className={probeResult.securityHeaders.csp ? 'text-emerald-400' : 'text-slate-500'}>{probeResult.securityHeaders.csp ? 'Active' : 'None'}</span>
                </div>
                <div className="text-slate-300">
                  X-Frame-Options: <span className="text-slate-400">{probeResult.securityHeaders.xFrameOptions || 'None'}</span>
                </div>
              </div>
            </div>

            {/* DNS & IP Resolution */}
            {dnsResult && (
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-sky-400 font-semibold">
                  <span>DNS & REVERSE IP RESOLUTION (DoH)</span>
                  <span className="text-slate-500 text-[11px]">{dnsResult.provider}</span>
                </div>
                <div className="text-slate-300">
                  IPv4 Addresses (A records): <span className="text-emerald-300">{dnsResult.ips.join(', ')}</span>
                </div>
                {dnsResult.ipv6s.length > 0 && (
                  <div className="text-slate-300">
                    IPv6 Addresses (AAAA records): <span className="text-cyan-300">{dnsResult.ipv6s.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Traceroute Hops Visualization */}
            {hops && (
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs font-mono space-y-2">
                <div className="font-semibold text-amber-400">NETWORK HOPS (TRACEROUTE SIMULATION)</div>
                <div className="space-y-1">
                  {hops.map((hop) => (
                    <div
                      key={hop.hop}
                      className="flex items-center justify-between p-1.5 bg-[#0B0F17] rounded border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-slate-500 font-bold">{hop.hop}.</span>
                        <span className="text-slate-200 font-semibold">{hop.ip}</span>
                        <span className="text-slate-500">({hop.hostname})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">{hop.asNumber}</span>
                        <span className="text-emerald-400 font-semibold">{hop.rttMs} ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
