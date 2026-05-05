'use client';

import { useState } from 'react';

export default function VerifierPanel() {
  const [gpsFail, setGpsFail] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const runVerifier = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 900);
  };

  return (
    <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
      <div className="p-3 px-4 border-b border-border text-[12px] font-medium">
        Triple-factor verifier
      </div>
      <div className="p-4">
        <div className="text-[11px] text-muted mb-3">
          Live verification engine — run a test scan to see all three factors.
        </div>

        <div className="bg-surf2 rounded-lg p-2.5 px-3 border border-[rgba(16,217,126,0.3)] mb-2">
          <div className="text-[9px] font-bold tracking-[1.5px] text-muted mb-1">FACTOR 1 · QR HMAC</div>
          <div className="text-[12px] font-semibold text-green-custom">✓ Signature matched</div>
          <div className="text-[10px] text-muted mt-0.5">board_014 → participant_032 · HMAC-SHA256</div>
        </div>

        <div className={`bg-surf2 rounded-lg p-2.5 px-3 border mb-2 ${gpsFail ? 'border-[rgba(255,90,90,0.3)]' : 'border-[rgba(16,217,126,0.3)]'}`}>
          <div className="text-[9px] font-bold tracking-[1.5px] text-muted mb-1">FACTOR 2 · GPS GEOFENCE</div>
          <div className={`text-[12px] font-semibold ${gpsFail ? 'text-red-custom' : 'text-green-custom'}`}>
            {gpsFail ? '✗ 4,823 m — outside 200 m fence' : '✓ 84 m from centroid'}
          </div>
          <div className="text-[10px] text-muted mt-0.5">5.7456°N 0.3214°W · within 200 m fence</div>
        </div>

        <div className="bg-surf2 rounded-lg p-2.5 px-3 border border-[rgba(16,217,126,0.3)] mb-2">
          <div className="text-[9px] font-bold tracking-[1.5px] text-muted mb-1">FACTOR 3 · TIMESTAMP</div>
          <div className="text-[12px] font-semibold text-green-custom">✓ Δt = 4 s</div>
          <div className="text-[10px] text-muted mt-0.5">NTP-synced · within ±90 min window</div>
        </div>

        <div className={`rounded-lg p-2.5 px-3 mt-1 ${gpsFail ? 'bg-adim border border-[rgba(244,161,52,0.2)]' : 'bg-gdim border border-[rgba(16,217,126,0.2)]'}`}>
          {gpsFail ? (
            <>
              <div className="text-[12px] font-bold text-amber-custom">FLAGGED — Payout blocked</div>
              <div className="text-[10px] text-muted mt-1">GPS outside geofence · flagged for Queen Mother review</div>
            </>
          ) : (
            <>
              <div className="text-[12px] font-bold text-green-custom">HARDENED — Payout queued</div>
              <div className="text-[10px] text-muted mt-1">scan_id: scn_8af4b · GHS 0.25 → MTN ****7731</div>
            </>
          )}
        </div>

        <label className="flex items-center gap-1.5 text-[11px] text-muted mt-3 mb-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="accent-green-custom"
            checked={gpsFail}
            onChange={(e) => setGpsFail(e.target.checked)}
          />
          Simulate GPS failure (outside geofence)
        </label>
        
        <button 
          onClick={runVerifier}
          disabled={isVerifying}
          className="w-full bg-gdim border border-[rgba(16,217,126,0.35)] rounded-lg p-2 text-[12px] font-semibold text-green-custom mt-2 hover:bg-[rgba(16,217,126,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying…' : 'Run verification →'}
        </button>
      </div>
    </div>
  );
}
