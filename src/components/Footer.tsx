import React from 'react';
import { Activity, Github, Settings } from 'lucide-react';

interface Props {
  networkCallCount: number;
  onOpenNetwork: () => void;
  onOpenSettings: () => void;
}

export const Footer: React.FC<Props> = ({
  networkCallCount,
  onOpenNetwork,
  onOpenSettings,
}) => {
  return (
    <footer className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-2.5 bg-[#0B0F17]/95 backdrop-blur-md border-t border-slate-800/80 font-mono text-xs text-slate-400">
      {/* Left: Version */}
      <div className="flex items-center gap-3">
        <span className="text-slate-300 font-semibold">WebCoder Tools</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-500">v1.0.0-pwa</span>
      </div>

      {/* Right: Network Calls Counter, GitHub, Settings */}
      <div className="flex items-center gap-4">
        {/* Network Calls Counter */}
        <button
          onClick={onOpenNetwork}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors border ${
            networkCallCount > 0
              ? 'bg-cyan-950/50 border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Open Outbound Network Call Audit Log"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Network Calls: </span>
          <span className="font-bold text-slate-100">{networkCallCount}</span>
        </button>

        {/* GitHub link */}
        <a
          href="https://github.com/webcoder-tools/webcoder"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          title="GitHub Repository"
        >
          <Github className="w-3.5 h-3.5" />
          <span className="hidden md:inline">GitHub</span>
        </a>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          title="Workbench Settings"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Settings</span>
        </button>
      </div>
    </footer>
  );
};
