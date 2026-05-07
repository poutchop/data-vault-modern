'use client';

import { useState, useEffect } from 'react';

interface GatekeeperProps {
  children: React.ReactNode;
}

export default function Gatekeeper({ children }: GatekeeperProps) {
  const [pin, setPin] = useState('');
  const [agentName, setAgentName] = useState('');
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<'locked' | 'field' | 'admin'>('locked');
  const [showIdentityStep, setShowIdentityStep] = useState(false);

  useEffect(() => {
    try {
      const unlocked = sessionStorage.getItem('vault_unlocked');
      if (unlocked === 'admin') setMode('admin');
      else if (unlocked === 'field') setMode('field');
    } catch (e) {}
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const ADMIN_PIN = '1234'; 
    const FIELD_PIN = '0000';
    const cleanPin = pin.trim();
    
    if (cleanPin === ADMIN_PIN) {
      try { sessionStorage.setItem('vault_unlocked', 'admin'); } catch (e) {}
      setMode('admin');
      setError(false);
    } else if (cleanPin === FIELD_PIN) {
      setShowIdentityStep(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 800);
    }
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentName.trim().length < 2) return;
    
    try { 
      sessionStorage.setItem('vault_unlocked', 'field');
      sessionStorage.setItem('vault_agent_name', agentName.trim());
    } catch (e) {}
    setMode('field');
  };

  if (mode !== 'locked') return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0a0b14] flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-[#141521] border border-[rgba(255,255,255,0.1)] p-10 rounded-[32px] shadow-2xl text-center">
        <div className="w-16 h-16 bg-[rgba(16,217,126,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[rgba(16,217,126,0.2)]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10d97e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        
        {!showIdentityStep ? (
          <>
            <h2 className="text-2xl font-bold mb-2 text-white">Security Access</h2>
            <p className="text-muted text-sm mb-10 leading-relaxed">Please enter your 4-digit PIN to unlock the Data Vault.</p>

            <form onSubmit={handleUnlock} className="space-y-6">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className={`w-full bg-[#0a0b14] border ${error ? 'border-red-500 animate-shake' : 'border-[rgba(255,255,255,0.1)]'} rounded-2xl p-5 text-center text-4xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-green-custom transition-all`}
                autoFocus
              />
              
              <button
                type="submit"
                className="w-full bg-green-custom text-black font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-green-custom/20 text-sm uppercase tracking-widest"
              >
                Unlock Vault
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2 text-white">Identity Check</h2>
            <p className="text-muted text-sm mb-10 leading-relaxed">Please enter your Agent Name to access your personalized dashboard.</p>

            <form onSubmit={handleIdentitySubmit} className="space-y-6">
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent Name"
                className="w-full bg-[#0a0b14] border border-[rgba(255,255,255,0.1)] rounded-2xl p-5 text-center text-xl font-semibold text-white focus:outline-none focus:border-green-custom transition-all"
                autoFocus
                required
              />
              
              <button
                type="submit"
                className="w-full bg-green-custom text-black font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-green-custom/20 text-sm uppercase tracking-widest"
              >
                Access Dashboard
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowIdentityStep(false)}
                className="text-[10px] text-muted uppercase tracking-widest hover:text-white transition-colors"
              >
                Back to PIN
              </button>
            </form>
          </>
        )}

        <div className="mt-10 pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-2 text-[10px] text-muted uppercase tracking-widest font-bold">
          <div className="flex justify-between items-center px-4">
             <span>Field Access</span>
             <span className="text-blue-custom">0000</span>
          </div>
          <div className="flex justify-between items-center px-4">
             <span>Admin Access</span>
             <span className="text-amber-custom">1234</span>
          </div>
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
