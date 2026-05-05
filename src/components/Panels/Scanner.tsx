'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Search, Lock, CheckCircle, XCircle, Zap, RefreshCw, User, Phone, MapPin, Hash, Save, FileText } from 'lucide-react';
import Webcam from 'react-webcam';
import { supabase } from '@/lib/supabase';
import { useVaultData } from '@/hooks/useVaultData';

interface ScannerProps {
  onScanComplete?: (newScan: any) => void;
  isAdmin?: boolean;
}

export default function Scanner({ onScanComplete, isAdmin }: ScannerProps) {
  const [step, setStep] = useState(1);
  const [accuracy, setAccuracy] = useState(137);
  const [isLocked, setIsLocked] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    agentName: '',
    personName: '',
    bridgeNumber: '',
    phoneNumber: '',
    siteName: 'Berekuso Farm A',
    actionType: 'firewood_avoidance'
  });

  const webcamRef = useRef<Webcam>(null);

  // GPS Simulation
  useEffect(() => {
    if (step === 1 && accuracy > 45) {
      const timer = setInterval(() => {
        setAccuracy(prev => {
          if (prev <= 45) {
            clearInterval(timer);
            setIsLocked(true);
            return prev;
          }
          return prev - Math.floor(Math.random() * 15);
        });
      }, 800);
      return () => clearInterval(timer);
    }
  }, [step, accuracy]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setStep(3); // Move to Data Entry step
    }
  }, [webcamRef]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // TRIGGER INSTANT VERIFICATION DATA
    const timestamp = new Date().toISOString();
    const mockLat = 5.7456 + (Math.random() - 0.5) * 0.001;
    const mockLng = -0.3214 + (Math.random() - 0.5) * 0.001;

    const newRecord = {
      ...formData,
      image: capturedImage,
      timestamp,
      gps: [mockLat, mockLng],
      id: Math.random().toString(36).substr(2, 9)
    };

    // Simulation of Global Impact
    const globalScanData = {
      id: newRecord.id,
      participant_name: formData.personName,
      board_id: formData.bridgeNumber,
      action_type: formData.actionType,
      status: 'hardened' as const,
      site: formData.siteName,
      gps_lat: mockLat,
      gps_lng: mockLng,
      created_at: timestamp
    };

    setTimeout(() => {
      setHistory(prev => [newRecord, ...prev].slice(0, 10));
      if (onScanComplete) onScanComplete(globalScanData);
      setIsSaving(false);
      setStep(4);
      
      // AUTO-EXCEL LOGGING (Simulation)
      console.log('Record automatically indexed for Excel export');
    }, 1200);
  };

  const resetScanner = () => {
    setStep(1); // Return to GPS lock
    setAccuracy(137);
    setIsLocked(false);
    setCapturedImage(null);
    setFormData(prev => ({
      ...prev,
      personName: '',
      bridgeNumber: '',
      phoneNumber: '',
      actionType: 'firewood_avoidance'
    }));
  };

  const downloadHistory = () => {
    const headers = ['ID', 'Name', 'Bridge #', 'Phone', 'Site', 'Action', 'Timestamp', 'GPS'];
    const rows = history.map(r => [
      r.id, 
      r.personName, 
      r.bridgeNumber, 
      r.phoneNumber, 
      r.siteName, 
      r.actionType, 
      r.timestamp, 
      `"${r.gps.join(',')}"`
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vault_scans_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_380px] gap-[14px]">
      <div className="bg-surf border border-border rounded-[10px] overflow-hidden flex flex-col min-h-[650px]">
        <div className="p-3 px-4 border-b border-border flex items-center gap-2 text-[12px] font-medium">
          <Camera size={14} className="text-muted" />
          Data Vault Field Audit — {step === 0 ? 'Agent Setup' : `Step ${step}`}
          <span className="text-muted text-[10px] ml-auto font-normal">Ready for storage</span>
        </div>

        <div className="p-8 flex-1 flex flex-col">
          {/* Progress Bar */}
          <div className="flex gap-1.5 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i < step ? 'bg-green-custom' : i === step ? 'bg-green-custom/40 overflow-hidden' : 'bg-surf2'
                }`}
              >
                {i === step && (
                  <div className="h-full bg-green-custom animate-progress-fast shadow-[0_0_8px_rgba(16,217,126,0.5)]"></div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
            
            {/* STEP 0: AGENT IDENTIFICATION */}
            {step === 1 && formData.agentName === '' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full text-left">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-blue-custom/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-custom/20">
                    <User className="text-blue-custom" size={32} />
                  </div>
                  <h3 className="text-[20px] font-bold">Field Identification</h3>
                  <p className="text-[13px] text-muted">Identify yourself and your site before auditing.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5">Your Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      className="w-full bg-surf2 border border-border rounded-xl px-4 py-4 text-[14px] outline-none focus:border-blue-custom transition-all"
                      onChange={e => setFormData({...formData, agentName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5">Current Site Location</label>
                    <select 
                      value={formData.siteName} 
                      onChange={e => setFormData({...formData, siteName: e.target.value})}
                      className="w-full bg-surf2 border border-border rounded-xl px-4 py-4 text-[14px] outline-none focus:border-blue-custom transition-all appearance-none"
                    >
                      <option>Berekuso Farm A</option>
                      <option>Berekuso Farm B</option>
                      <option>Tomato Co-op West</option>
                      <option>Aburi Highlands</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-adim/30 border border-amber-custom/20 rounded-xl flex gap-3">
                  <div className="mt-0.5"><Lock size={14} className="text-amber-custom" /></div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Once you start, all scans will be linked to <span className="text-amber-custom font-bold">{formData.siteName}</span>. This cannot be changed during the session.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 1: GPS */}
            {step === 1 && formData.agentName !== '' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <h3 className="text-[20px] font-bold mb-2">Step 1: GPS Lock</h3>
                <p className="text-[13px] text-muted mb-8">Verifying field location for the dMRV audit...</p>

                <div className="w-full bg-surf2 border border-border rounded-2xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-40 h-40 border-2 border-green-custom rounded-full animate-ping"></div>
                  </div>
                  <div className={`mb-4 transition-transform duration-500 ${isLocked ? 'scale-110' : 'animate-bounce'}`}>
                    {isLocked ? (
                      <div className="w-16 h-16 bg-gdim rounded-full flex items-center justify-center border border-green-custom/30 shadow-[0_0_20px_rgba(16,217,126,0.2)]">
                        <CheckCircle className="text-green-custom" size={32} />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-surf2 rounded-full flex items-center justify-center border border-border shadow-inner">
                        <Search className="text-amber-custom animate-pulse" size={32} />
                      </div>
                    )}
                  </div>
                  <div className="text-[14px] font-bold mb-1">
                    {isLocked ? <span className="text-green-custom">GPS Verified</span> : <span className="text-amber-custom">Searching... ({accuracy}m)</span>}
                  </div>
                </div>

                <button onClick={() => setStep(2)} className="w-full mt-6 py-4 rounded-xl bg-green-custom text-black font-bold text-[15px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Proceed to Camera <Zap size={16} fill="currentColor" />
                </button>
              </div>
            )}

            {/* STEP 2: CAMERA */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                <h3 className="text-[20px] font-bold mb-2">Step 2: Capture Vault</h3>
                <p className="text-[13px] text-muted mb-6">Align the visual bridge and vault frame.</p>

                <div className="w-full aspect-video bg-black rounded-2xl border-2 border-green-custom/50 overflow-hidden relative shadow-2xl">
                  <Webcam audio={false} ref={webcamRef} screenshotFormat="image/webp" videoConstraints={{ facingMode: "environment" }} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none flex items-center justify-center">
                    <div className="w-1/2 h-1/2 border-2 border-dashed border-green-custom/40 rounded-xl"></div>
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <button onClick={capture} className="w-16 h-16 bg-white rounded-full border-4 border-green-custom flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                      <div className="w-12 h-12 bg-green-custom rounded-full flex items-center justify-center"><Camera size={24} className="text-black" /></div>
                    </button>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="mt-6 text-[11px] text-muted hover:text-red-custom transition-colors flex items-center gap-1 mx-auto">
                  <XCircle size={12} /> Cancel audit
                </button>
              </div>
            )}

            {/* STEP 3: DATA ENTRY */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg border border-border overflow-hidden">
                    <img src={capturedImage!} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold">Step 3: Verification Details</h3>
                    <p className="text-[11px] text-muted uppercase tracking-wider">Linking scan to database...</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5"><User size={10} /> Person on Visual Bridge</label>
                      <input required type="text" value={formData.personName} onChange={e => setFormData({...formData, personName: e.target.value})} placeholder="Full name" className="w-full bg-surf2 border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-green-custom transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5"><Hash size={10} /> Visual Bridge ID #</label>
                      <input required type="text" value={formData.bridgeNumber} onChange={e => setFormData({...formData, bridgeNumber: e.target.value})} placeholder="e.g. VB-014" className="w-full bg-surf2 border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-green-custom transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5"><Phone size={10} /> Phone Number</label>
                      <input required type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="MTN / Telecel number" className="w-full bg-surf2 border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-green-custom transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5"><MapPin size={10} /> Audit Site (Locked)</label>
                      <div className="w-full bg-surf2/50 border border-border rounded-xl px-4 py-3 text-[13px] text-muted">
                        {formData.siteName}
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={isSaving} className="w-full bg-green-custom text-black font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50">
                    {isSaving ? <><RefreshCw className="animate-spin" size={18} /> Storing data...</> : <><Save size={18} /> Commit to Database</>}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-gdim rounded-full flex items-center justify-center mx-auto mb-6 border border-green-custom/20">
                  <CheckCircle className="text-green-custom" size={40} />
                </div>
                <h3 className="text-[24px] font-bold mb-2">Audit Stored!</h3>
                <p className="text-[13px] text-muted mb-8 leading-relaxed">
                  Record for <span className="text-text font-bold">{formData.personName}</span> has been cryptographically secured in the Data Vault.
                </p>

                <div className="bg-surf2 border border-border rounded-2xl p-6 mb-8 text-left space-y-3">
                  <div className="flex justify-between text-[11px]"><span className="text-muted">Bridge ID</span><span className="font-bold">{formData.bridgeNumber}</span></div>
                  <div className="flex justify-between text-[11px]"><span className="text-muted">GPS Lock</span><span className="text-green-custom font-bold">5.7456°N (MATCH)</span></div>
                  <div className="flex justify-between text-[11px]"><span className="text-muted">Vault Status</span><span className="text-blue-custom font-bold italic">HARDENED</span></div>
                </div>

                <button onClick={resetScanner} className="w-full bg-green-custom text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
                  <RefreshCw size={18} /> New Audit
                </button>
              </div>
            )}

            <button className="mt-10 text-[11px] text-muted hover:text-green-custom transition-colors underline underline-offset-4 decoration-border">Troubleshoot scanning issues</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[14px]">
        {/* RECENT HISTORY CARD */}
        <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium flex justify-between items-center">
            Database History
            {isAdmin && (
              <button onClick={downloadHistory} disabled={history.length === 0} className="text-green-custom text-[10px] flex items-center gap-1 hover:underline disabled:opacity-30">
                <FileText size={10} /> Excel/CSV
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center opacity-30">
              <Camera size={24} className="mb-2" />
              <p className="text-[11px]">No records stored yet</p>
            </div>
          ) : (
            <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto">
              {history.map((record, idx) => (
                <div key={idx} className="bg-surf2 border border-border p-3 rounded-lg flex items-center gap-3 animate-in slide-in-from-right-2">
                  <div className="w-10 h-10 rounded bg-black overflow-hidden flex-shrink-0">
                    <img src={record.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold truncate">{record.personName}</div>
                    <div className="text-[10px] text-muted flex items-center gap-2">
                      <span>#{record.bridgeNumber}</span>
                      <span>•</span>
                      <span className="text-green-custom">Stored</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR PROTOCOL CARD */}
        <div className="bg-surf border border-border rounded-[10px] overflow-hidden flex-1 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium">QR Protocol — CC-v1</div>
          <div className="p-4 font-mono text-[10px] leading-relaxed">
            <div className="bg-adim p-3 rounded border border-amber-custom/20 text-amber-custom">
              Protocol verification active.<br/>
              Database sync: Real-time.<br/>
              Retention: Persistent.
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-progress-fast { animation: progress 1.5s infinite linear; }
      `}</style>
    </div>
  );
}
