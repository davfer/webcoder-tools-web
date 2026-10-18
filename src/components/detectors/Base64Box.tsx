import React, { useState } from 'react';
import { Base64Analysis, encodeBase64 } from '../../utils/base64Engine';
import { Copy, Check, Maximize2, Minimize2, Binary, Code2 } from 'lucide-react';

interface Props {
  analysis: Base64Analysis;
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const Base64Box: React.FC<Props> = ({
  analysis,
  rawInput,
  isFocused,
  onToggleFocus,
  onUpdateInput,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'hex'>('text');
  const [encodeInput, setEncodeInput] = useState('');
  const [urlSafeEncode, setUrlSafeEncode] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const encodedResult = encodeInput ? encodeBase64(encodeInput, urlSafeEncode) : '';

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-cyan-500 shadow-xl shadow-cyan-950/20' : 'hover:border-slate-700'}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-sm font-semibold text-slate-100">Base64 Inspector & Encoder</span>
          <span className="text-xs text-slate-400 font-mono">
            {analysis.type === 'url-safe' ? 'URL-Safe RFC 4648' : analysis.type === 'base32' ? 'Base32' : 'Standard Base64'}
          </span>
          <span className="text-xs text-slate-500 font-mono">· {analysis.encodedSize}B in → {analysis.decodedSize}B out</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0B0F17] rounded-lg p-0.5 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewMode('text')}
              className={`px-2 py-1 rounded transition-colors ${viewMode === 'text' ? 'bg-cyan-600/30 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Text
            </button>
            <button
              onClick={() => setViewMode('hex')}
              className={`px-2 py-1 rounded transition-colors ${viewMode === 'hex' ? 'bg-cyan-600/30 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Hex Dump
            </button>
          </div>

          <button
            onClick={() => handleCopy(analysis.decodedText)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors"
            title="Copy Decoded Payload"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>

          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus Base64 Tool'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Decoded content */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>DECODED OUTPUT:</span>
            <span>{analysis.isPrintable ? 'UTF-8 Printable Text' : 'Binary Payload'}</span>
          </div>
          {viewMode === 'text' ? (
            <pre className="p-3 bg-[#0B0F17] rounded-lg border border-slate-800/90 text-sm font-mono text-emerald-300 overflow-x-auto max-h-56 whitespace-pre-wrap select-all">
              {analysis.decodedText || '[Empty]'}
            </pre>
          ) : (
            <pre className="p-3 bg-[#0B0F17] rounded-lg border border-slate-800/90 text-xs font-mono text-cyan-300 overflow-x-auto max-h-56 whitespace-pre-wrap">
              {analysis.hexDump}
            </pre>
          )}
        </div>

        {/* Live Re-encoder in Focus Mode or Expandable */}
        {isFocused && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="font-semibold text-cyan-300">LIVE BASE64 ENCODER:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={urlSafeEncode}
                  onChange={(e) => setUrlSafeEncode(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span>URL-Safe (- and _)</span>
              </label>
            </div>
            <input
              type="text"
              placeholder="Type string to encode to base64..."
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
            {encodedResult && (
              <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs text-cyan-300">
                <span className="truncate pr-2">{encodedResult}</span>
                <button
                  onClick={() => onUpdateInput(encodedResult)}
                  className="px-2 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 rounded border border-cyan-500/30 whitespace-nowrap"
                >
                  Load in Textarea
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
