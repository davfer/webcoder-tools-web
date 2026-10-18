import React, { useState, useEffect } from 'react';
import { Activity, Github, Settings, Star } from 'lucide-react';

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
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('https://api.github.com/repos/davfer/webcoder-tools-web')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silent catch for offline or network isolation
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-2.5 bg-[#0B0F17]/95 backdrop-blur-md border-t border-slate-800/80 font-mono text-xs text-slate-400">
      {/* Left: Version (Title removed as requested) */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 font-mono text-[11px]">v1.0.0-pwa</span>
      </div>

      {/* Right: Network Calls Counter, GitHub Star Badge, Settings */}
      <div className="flex items-center gap-3.5">
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

        {/* GitHub Star Badge */}
        <a
          href="https://github.com/davfer/webcoder-tools-web"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-mono font-medium rounded border border-slate-700/80 bg-slate-850 hover:border-slate-600 transition-colors shadow-sm group overflow-hidden"
          title="Star davfer/webcoder-tools-web on GitHub"
        >
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-200 group-hover:bg-slate-700 group-hover:text-white transition-colors border-r border-slate-700/80">
            <Github className="w-3.5 h-3.5" />
            <span className="font-sans font-medium text-[11px]">Star</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-slate-900/90 group-hover:bg-slate-850 text-amber-400 font-sans font-semibold text-[11px] transition-colors">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-300">{stars !== null ? stars : '★'}</span>
          </span>
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
