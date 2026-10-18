import React, { useEffect, useState } from 'react';
import { networkTracker } from '../services/networkTracker';
import { NetworkCallLog } from '../types';
import { X, Trash2, ArrowUpRight, Activity } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<NetworkCallLog[]>([]);

  useEffect(() => {
    const unsubscribe = networkTracker.subscribe((updated) => {
      setLogs(updated);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#111827] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#161F30] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-100 text-sm">Network Audit Log</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {logs.length} calls
            </span>
          </div>

          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={() => networkTracker.clear()}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No outbound network calls made.</p>
              <p className="text-[11px] mt-1 text-slate-600">
                WebCoder executes 100% locally. Calls occur strictly when executing live URI ping or DNS resolution.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#0B0F17] rounded-lg border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 font-bold text-cyan-400">
                      {log.method}
                    </span>
                    <span className="text-slate-400 text-[11px]">{log.timestamp}</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      log.status === 'FAILED'
                        ? 'text-rose-400'
                        : Number(log.status) >= 400
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {log.status} {log.durationMs ? `(${log.durationMs}ms)` : ''}
                  </span>
                </div>

                <div className="text-slate-300 break-all select-all">{log.url}</div>

                {log.details && (
                  <div className="text-[11px] text-slate-500">{log.details}</div>
                )}
                {log.error && (
                  <div className="text-[11px] text-rose-400">{log.error}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
