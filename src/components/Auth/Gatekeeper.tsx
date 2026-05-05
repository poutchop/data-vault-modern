'use client';

import { useState, useEffect } from 'react';

interface GatekeeperProps {
  children: React.ReactNode;
}

export default function Gatekeeper({ children }: GatekeeperProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<'locked' | 'field' | 'admin'>('locked');

  // Check if session was already unlocked
  useEffect(() => {
    const unlocked = sessionStorage.getItem('vault_unlocked');
    if (unlocked === 'admin') {
      setMode('admin');
    } else if (unlocked === 'field') {
      setMode('field');
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const ADMIN_PIN = '1234'; 
    const FIELD_PIN = '0000'; // Default PIN for field users
    
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('vault_unlocked', 'admin');
      setMode('admin');
      setError(false);
    } else if (pin === FIELD_PIN) {
      sessionStorage.setItem('vault_unlocked', 'field');
      setMode('field');
      setError(false);
    } else {
      setError(true);
      setPin('');
      // Shake animation effect
      setTimeout(() => setError(false), 500);
    }
  };

  if (mode !== 'locked') return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[1000] bg-bg flex items-center justify-center p-6 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-sm w-full bg-surf border border-border p-8 rounded-2xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-adim rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f4a134" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        
        <p className="text-muted text-sm mb-8 leading-relaxed">
          Enter PIN to continue.<br/>
          <span className="text-[10px] text-blue-custom font-bold">0000 = Field Mode</span> (Scanner/Impact)<br/>
          <span className="text-[10px] text-amber-custom font-bold">1234 = Admin Mode</span> (All Access)
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className={`w-full bg-surf2 border ${error ? 'border-red-custom animate-shake' : 'border-border'} rounded-xl p-4 text-center text-3xl tracking-[1em] font-mono focus:outline-none focus:border-amber-custom transition-all`}
            autoFocus
          />
          
          {error && <p className="text-red-custom text-xs font-medium">Incorrect PIN. Please try again.</p>}
          
          <button
            type="submit"
            className="w-full bg-amber-custom text-black font-bold py-4 rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-amber-custom/20"
          >
            Unlock Vault
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 text-[10px] text-muted uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-green-custom"></div>
          Secure Pilot Environment
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
