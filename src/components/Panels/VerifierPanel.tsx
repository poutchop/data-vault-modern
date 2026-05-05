'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VerifierPanel() {
  const [gpsFail, setGpsFail] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const runVerifier = async () => {
    setIsVerifying(true);
    setStatusMsg('');
    
    try {
      // 1. Get a random participant to link the scan to
      const { data: participants } = await supabase
        .from('participants')
        .select('id')
        .limit(10);
      
      const participantId = participants && participants.length > 0 
        ? participants[Math.floor(Math.random() * participants.length)].id 
        : null;

      if (!participantId) {
        console.warn('No participants found in database. Scan will be unlinked.');
      }

      // 2. Simulate delay
      await new Promise(resolve => setTimeout(resolve, 900));

      // 3. Insert the scan
      const { error } = await supabase.from('scans').insert({
        participant_id: participantId,
        board_id: String(Math.floor(Math.random() * 30) + 1).padStart(3, '0'),
        action_type: 'firewood_avoidance',
        status: gpsFail ? 'flagged' : 'hardened',
        gps_lat: gpsFail ? 5.8000 : 5.7456,
        gps_lng: gpsFail ? -0.4000 : -0.3214,
        scan_time_device: new Date().toISOString(),
      });

      if (error) throw error;
      
      setStatusMsg('Success! Record added to database.');
    } catch (error) {
      console.error('Error during verification:', error);
      setStatusMsg('Error connecting to Supabase.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
      <div className="p-3 px-4 border-b border-border text-[12px] font-medium">
        Triple-factor verifier
      </div>
      <div className="p-4">
        <div className="text-[11px] text-muted mb-3">
          Live verification engine — clicking the button below will insert a real record into your database.
        </div>

        <div className="bg-surf2 rounded-lg p-2.5 px-3 border border-[rgba(16,217,126,0.3)] mb-2">
          <div className="text-[9px] font-bold tracking-[1.5px] text-muted mb-1">FACTOR 1 · QR HMAC</div>
          <div className="text-[12px] font-semibold text-green-custom">✓ Signature matched</div>
          <div className="text-[10px] text-muted mt-0.5">SHA256 Match · Berekuso Board</div>
        </div>

        <div className={`bg-surf2 rounded-lg p-2.5 px-3 border mb-2 ${gpsFail ? 'border-[rgba(255,90,90,0.3)]' : 'border-[rgba(16,217,126,0.3)]'}`}>
          <div className="text-[9px] font-bold tracking-[1.5px] text-muted mb-1">FACTOR 2 · GPS GEOFENCE</div>
          <div className={`text-[12px] font-semibold ${gpsFail ? 'text-red-custom' : 'text-green-custom'}`}>
            {gpsFail ? '✗ Outside 200 m fence' : '✓ 84 m from centroid'}
          </div>
          <div className="text-[10px] text-muted mt-0.5">5.7456°N 0.3214°W · Berekuso Centroid</div>
        </div>

        <div className="bg-surf2 rounded-lg p-2.5 px-3 border border-[rgba(16,217,126,0.3)] mb-2">
          <div className="text-[9px] font-bold tracking-[1.5px] text-muted mb-1">FACTOR 3 · TIMESTAMP</div>
          <div className="text-[12px] font-semibold text-green-custom">✓ Δt = 4 s</div>
          <div className="text-[10px] text-muted mt-0.5">NTP-synced · Within window</div>
        </div>

        <div className={`rounded-lg p-2.5 px-3 mt-1 ${gpsFail ? 'bg-adim border border-[rgba(244,161,52,0.2)]' : 'bg-gdim border border-[rgba(16,217,126,0.2)]'}`}>
          {gpsFail ? (
            <>
              <div className="text-[12px] font-bold text-amber-custom">FLAGGED — Payout blocked</div>
              <div className="text-[10px] text-muted mt-1">GPS failure · flagged for manual review</div>
            </>
          ) : (
            <>
              <div className="text-[12px] font-bold text-green-custom">HARDENED — Payout queued</div>
              <div className="text-[10px] text-muted mt-1">GHS 0.25 → MTN/Telecel MoMo</div>
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
          Simulate GPS failure
        </label>
        
        <button 
          onClick={runVerifier}
          disabled={isVerifying}
          className="w-full bg-gdim border border-[rgba(16,217,126,0.35)] rounded-lg p-2 text-[12px] font-semibold text-green-custom mt-2 hover:bg-[rgba(16,217,126,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying…' : 'Run verification →'}
        </button>
        
        {statusMsg && (
          <p className={`text-[10px] text-center mt-2 ${statusMsg.includes('Error') ? 'text-red-custom' : 'text-green-custom'}`}>
            {statusMsg}
          </p>
        )}
      </div>
    </div>
  );
}

