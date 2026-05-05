'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopbarProps {
  onRelock?: () => void;
}

export default function Topbar({ onRelock }: TopbarProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial state
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Top Partner Bar */}
      <div className="bg-[#0f1117] border-b border-border py-2 px-6 flex items-center gap-2 text-[11px]">
        <div className="w-4 h-4 bg-green-custom rounded-sm flex items-center justify-center">
          <svg viewBox="0 0 14 14" fill="none" className="w-2.5 h-2.5"><path d="M7 1 L12 10 H2 L7 1 Z" fill="#000"/></svg>
        </div>
        <span className="text-muted">In partnership with</span>
        <span className="text-blue-custom font-bold">Ashesi University</span>
        <span className="text-muted text-[9px] ml-1 uppercase tracking-wider opacity-50">• Data Vault Pilot Phase 1</span>
      </div>

      <div className="bg-surf border-b border-border py-3 px-6 flex items-center gap-3 sticky top-0 z-[100]">
      <div className="w-[30px] h-[30px] rounded-lg bg-gdim border border-[rgba(16,217,126,0.25)] flex items-center justify-center">
        <svg viewBox="0 0 14 14" fill="none" className="w-[14px] h-[14px]">
          <path d="M7 1 L12 10 H2 L7 1 Z" fill="#10d97e" opacity=".7"/>
          <path d="M 7 1 L 12 10 H 7 V 1 Z" fill="#10d97e"/>
          <circle cx="7" cy="6" r="2" fill="#fff"/>
        </svg>
      </div>
      <div className="text-[14px] font-bold tracking-[0.5px] text-text">
        DATA VAULT <span className="text-muted font-normal ml-1">by Carbon Clarity</span>
      </div>
      <div className="bg-surf2 border border-border rounded-md px-2.5 py-1 text-[11px] text-muted">
        Berekuso Pilot · Week 4
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-green-custom font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-green-custom animate-pulse"></div>
          Live hardening feed
        </div>
        
        <button className="bg-surf2 border border-border rounded-lg px-3 py-1.5 text-[11px] text-text hover:bg-border transition-colors flex items-center gap-1.5">
          <span className="text-blue-custom">⬇</span> Install
        </button>

        <button 
          onClick={toggleTheme}
          className="bg-surf2 border border-border rounded-lg p-1.5 text-[12px] text-muted hover:text-text transition-colors"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <button 
          onClick={onRelock}
          className="bg-surf2 border border-border rounded-lg px-4 py-1.5 text-[12px] font-medium text-text hover:bg-border transition-colors active:scale-95"
        >
          Sign In
        </button>
      </div>
    </div>
  </div>
);
}
