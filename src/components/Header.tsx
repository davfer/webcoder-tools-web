import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Terminal } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-6 px-6 py-3 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Brand Zone */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
          <Terminal className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          WebCoder Tools
        </span>
        <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500">
          webcoder.tools
        </span>
      </div>

      {/* Right Action Zone */}
      <div className="flex items-center gap-3 shrink-0">
        {/* PWA Install Button */}
        <PWAInstallButton />
      </div>
    </header>
  );
};
