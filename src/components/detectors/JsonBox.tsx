import React, { useState } from 'react';
import { JsonAnalysis, queryJsonPath } from '../../utils/jsonEngine';
import { Copy, Check, Maximize2, Minimize2, Search, Braces } from 'lucide-react';

interface Props {
  analysis: JsonAnalysis;
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const JsonBox: React.FC<Props> = ({
  analysis,
  rawInput,
  isFocused,
  onToggleFocus,
  onUpdateInput,
}) => {
  const [copied, setCopied] = useState(false);
  const [jsonPath, setJsonPath] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const queryResult = analysis.isValidJson && jsonPath ? queryJsonPath(analysis.parsed, jsonPath) : null;

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-emerald-500 shadow-xl shadow-emerald-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold text-slate-100">JSON Inspector & Formatter</span>
          <span className="text-xs text-slate-400 font-mono">
            {analysis.stats.type.toUpperCase()} · {analysis.stats.keysCount} keys · depth {analysis.stats.depth} · {analysis.stats.sizeBytes} B
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateInput(analysis.formatted)}
            className="px-2 py-1 text-xs font-mono text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/50 rounded transition-colors"
            title="Format input with 2 spaces"
          >
            Beautify
          </button>
          <button
            onClick={() => onUpdateInput(analysis.minified)}
            className="px-2 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            title="Minify JSON"
          >
            Minify
          </button>
          <button
            onClick={() => handleCopy(analysis.formatted)}
            className="p-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors"
            title={copied ? 'Copied formatted JSON' : 'Copy Formatted JSON'}
            aria-label="Copy Formatted JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-emerald-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus JSON Tool'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* JSON Path Query Bar */}
        <div className="flex items-center gap-2 bg-[#0B0F17] p-2 rounded-lg border border-slate-800 text-xs font-mono">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Dot-notation query (e.g. services.auth.online or [0].id)..."
            value={jsonPath}
            onChange={(e) => setJsonPath(e.target.value)}
            className="w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none"
          />
          {jsonPath && (
            <button onClick={() => setJsonPath('')} className="text-slate-500 hover:text-slate-300 px-1">
              ✕
            </button>
          )}
        </div>

        {/* Query Evaluation Result */}
        {queryResult && (
          <div className="p-3 bg-slate-900/80 border border-emerald-500/30 rounded-lg text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold">QUERY RESULT: </span>
              {!queryResult.error && (
                <button
                  onClick={() => handleCopy(typeof queryResult.result === 'object' ? JSON.stringify(queryResult.result, null, 2) : String(queryResult.result))}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Copy Query Result"
                  aria-label="Copy Query Result"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            {queryResult.error ? (
              <span className="text-rose-400">{queryResult.error}</span>
            ) : (
              <pre className="mt-1 text-slate-200 overflow-x-auto whitespace-pre-wrap">
                {typeof queryResult.result === 'object'
                  ? JSON.stringify(queryResult.result, null, 2)
                  : String(queryResult.result)}
              </pre>
            )}
          </div>
        )}

        {/* Formatted JSON view */}
        <div className="relative group">
          <button
            onClick={() => handleCopy(analysis.formatted)}
            className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors opacity-80 hover:opacity-100"
            title={copied ? 'Copied formatted JSON' : 'Copy Formatted JSON'}
            aria-label="Copy Formatted JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="p-3 pr-10 bg-[#0B0F17] rounded-lg border border-slate-800/90 text-xs font-mono text-emerald-300 overflow-x-auto max-h-64 whitespace-pre">
            {analysis.formatted}
          </pre>
        </div>
      </div>
    </div>
  );
};
