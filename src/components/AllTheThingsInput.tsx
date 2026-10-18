import React, { useState } from 'react';
import { Copy, Check, Trash2, ClipboardPaste, Sparkles } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export const AllTheThingsInput: React.FC<Props> = ({ value, onChange, onClear }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch {}
  };

  const byteSize = new TextEncoder().encode(value).length;
  const lineCount = value ? value.split('\n').length : 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] overflow-hidden shadow-lg">
      {/* Textarea Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161F30] border-b border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-400">INPUT PAYLOAD</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{value.length.toLocaleString()} chars</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{lineCount} lines</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{byteSize.toLocaleString()} B</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Paste from clipboard"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
            <span>Paste</span>
          </button>

          {value && (
            <>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={copied ? 'Copied input text' : 'Copy input text'}
                aria-label="Copy input text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClear}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Primary Big Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste whatever you need to work: JWT tokens, URLs with query parameters, JSON payloads, X.509 PEM certificates, Kubernetes YAML manifests, Base64 strings, password hashes, or IP CIDR blocks..."
        rows={6}
        className="w-full p-4 bg-[#0B0F17] text-slate-200 placeholder-slate-600 font-mono text-xs leading-relaxed focus:outline-none resize-y min-h-[140px] max-h-[380px]"
        spellCheck={false}
      />
    </div>
  );
};
