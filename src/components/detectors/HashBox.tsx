import React, { useState, useEffect } from 'react';
import {
  detectHashType,
  calculateCRC32,
  calculateMD5,
  calculateWebCryptoHash,
  evaluatePassword,
  HashDetection,
  PasswordScore,
} from '../../utils/hashEngine';
import { Copy, Check, Maximize2, Minimize2, Hash, Shield, KeyRound } from 'lucide-react';

interface Props {
  rawInput: string;
  isFocused: boolean;
  onToggleFocus: () => void;
  onUpdateInput: (val: string) => void;
}

export const HashBox: React.FC<Props> = ({
  rawInput,
  isFocused,
  onToggleFocus,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [detection, setDetection] = useState<HashDetection>({
    isLikelyHash: false,
    algorithm: '',
    bitLength: 0,
    description: '',
  });
  const [passwordScore, setPasswordScore] = useState<PasswordScore | null>(null);

  useEffect(() => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setHashes({});
      setDetection({ isLikelyHash: false, algorithm: '', bitLength: 0, description: '' });
      setPasswordScore(null);
      return;
    }

    setDetection(detectHashType(trimmed));
    setPasswordScore(evaluatePassword(trimmed));

    const crc = calculateCRC32(trimmed);
    const md5 = calculateMD5(trimmed);

    Promise.all([
      calculateWebCryptoHash('SHA-1', trimmed),
      calculateWebCryptoHash('SHA-256', trimmed),
      calculateWebCryptoHash('SHA-512', trimmed),
    ]).then(([sha1, sha256, sha512]) => {
      setHashes({
        CRC32: crc,
        MD5: md5,
        'SHA-1': sha1,
        'SHA-256': sha256,
        'SHA-512': sha512,
      });
    });
  }, [rawInput]);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#111827] overflow-hidden transition-all ${isFocused ? 'ring-2 ring-amber-500 shadow-xl shadow-amber-950/20' : 'hover:border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161F30] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-sm font-semibold text-slate-100">Hash Tools & Checksums</span>
          {detection.isLikelyHash && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-300 font-mono">
              Detected: {detection.algorithm} ({detection.bitLength} bits)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {passwordScore && (
            <span className={`text-xs px-2 py-0.5 rounded font-mono border ${
              passwordScore.score === 'Military-grade' || passwordScore.score === 'Strong'
                ? 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300'
                : passwordScore.score === 'Fair'
                ? 'bg-amber-950/60 border-amber-800/50 text-amber-300'
                : 'bg-rose-950/60 border-rose-800/50 text-rose-300'
            }`}>
              Password: {passwordScore.score} ({passwordScore.entropyBits} bits)
            </span>
          )}

          <button
            onClick={() => handleCopy('sha256', hashes['SHA-256'] || hashes['MD5'] || '')}
            className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={copiedKey === 'sha256' ? 'Copied SHA-256' : 'Copy SHA-256 Digest'}
            aria-label="Copy SHA-256 Digest"
          >
            {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleFocus}
            className="p-1 text-slate-400 hover:text-amber-400 rounded transition-colors"
            title={isFocused ? 'Exit Focus Mode' : 'Focus Hash Tools'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Identified Hash info if input is a hash */}
        {detection.isLikelyHash && (
          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs font-mono text-amber-200">
            <span className="font-semibold text-amber-300">HASH SIGNATURE IDENTIFIED: </span>
            {detection.description}
          </div>
        )}

        {/* Checksums Table */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400">INSTANT CHECKSUMS (PAYLOAD DIGESTS):</div>
          <div className="space-y-1.5 font-mono text-xs">
            {Object.entries(hashes).map(([alg, digest]) => (
              <div
                key={alg}
                className="flex items-center justify-between p-2 bg-[#0B0F17] rounded-lg border border-slate-800/90 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="w-16 font-semibold text-amber-400/90 shrink-0">{alg}</span>
                  <span className="text-slate-300 truncate select-all">{digest}</span>
                </div>
                <button
                  onClick={() => handleCopy(alg, digest)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition-colors"
                  title={copiedKey === alg ? 'Copied' : `Copy ${alg}`}
                  aria-label={`Copy ${alg}`}
                >
                  {copiedKey === alg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Password Strength Card (if focused or string looks like a password) */}
        {passwordScore && (isFocused || passwordScore.entropyBits > 0) && (
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-xs font-mono text-slate-400 mb-2">PASSWORD ENTROPY & CRACK TIME:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
                <div className="text-slate-500">Entropy</div>
                <div className="text-slate-200 font-semibold">{passwordScore.entropyBits} bits</div>
              </div>
              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
                <div className="text-slate-500">Strength</div>
                <div className="text-amber-300 font-semibold">{passwordScore.score}</div>
              </div>
              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
                <div className="text-slate-500">Est. Crack Time</div>
                <div className="text-slate-200 font-semibold truncate">{passwordScore.crackTimeEstimate}</div>
              </div>
              <div className="p-2.5 bg-[#0B0F17] rounded border border-slate-800">
                <div className="text-slate-500">Charsets</div>
                <div className="text-slate-200 font-semibold">
                  {[
                    passwordScore.hasLower ? 'a-z' : null,
                    passwordScore.hasUpper ? 'A-Z' : null,
                    passwordScore.hasNumber ? '0-9' : null,
                    passwordScore.hasSymbol ? '#$!' : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
