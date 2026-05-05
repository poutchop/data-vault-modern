'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Topbar() {
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
      <div className="flex items-center gap-1.5 ml-auto text-[11px] text-green-custom font-medium">
        <div className="w-1.5 h-1.5 rounded-full bg-green-custom animate-pulse"></div>
        Live hardening feed
      </div>
      <button 
        onClick={toggleTheme}
        className="ml-3 bg-surf2 border border-border rounded-lg p-1.5 text-[12px] text-muted hover:text-text transition-colors"
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
}
