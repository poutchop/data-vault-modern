'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Search, Lock, CheckCircle, XCircle, Zap, RefreshCw, User, Phone, MapPin, Hash, Save, FileText } from 'lucide-react';
import Webcam from 'react-webcam';
import { database, SyncQueue, SatFarmMetrics, encryptPayload } from '@/lib/localDatabase';
import { audioGuidance } from '@/lib/audio/AudioGuidanceManager';
import { t } from '@/lib/i18n';
import * as piexif from 'piexifjs';
import { v4 as uuidv4 } from 'uuid';

function degToDmsRational(deg: number): [[number, number], [number, number], [number, number]] {
  const d = Math.floor(deg);
  const minFloat = (deg - d) * 60;
  const m = Math.floor(minFloat);
  const secFloat = (minFloat - m) * 60;
  const s = Math.round(secFloat * 10000);
  return [[d, 1], [m, 1], [s, 10000]];
}

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
  const [cameraKey, setCameraKey] = useState(1);
  
  // Form State
  const [formData, setFormData] = useState({
    agentName: '',
    personName: '',
    bridgeNumber: '',
    phoneNumber: '',
    siteName: 'Berekuso Farm A',
    actionType: 'firewood_avoidance',
    confidence: 'high'
  });

  const webcamRef = useRef<Webcam>(null);
  const isLockedRef = useRef(isLocked);
  
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // Strict GPS Lock with 45s Timeout Fallback
  useEffect(() => {
    if (step === 1 && formData.agentName !== '') {
      let timeoutRef: NodeJS.Timeout;
      let useHighAccuracy = true;
      let isFallback = false;

      const startGPS = () => {
        return navigator.geolocation.watchPosition(
          (position) => {
            const acc = Math.floor(position.coords.accuracy);
            setAccuracy(acc);
            
            if (acc <= 10 || isFallback) {
              setIsLocked(true);
              if (isFallback) {
                setFormData(prev => ({ ...prev, confidence: 'low' }));
              }
              audioGuidance.play('GPS_LOCKED');
            } else {
              setIsLocked(false);
            }
          },
          (error) => {
            console.error("GPS Error", error);
            audioGuidance.play('GPS_WARNING');
          },
          { enableHighAccuracy: useHighAccuracy, timeout: 5000, maximumAge: 0 }
        );
      };

      let watchId = startGPS();

      // 45-second timeout for low-accuracy cellular triangulation fallback
      timeoutRef = setTimeout(() => {
        if (!isLockedRef.current) {
          navigator.geolocation.clearWatch(watchId);
          useHighAccuracy = false;
          isFallback = true;
          watchId = startGPS();
        }
      }, 45000);

      return () => {
        navigator.geolocation.clearWatch(watchId);
        clearTimeout(timeoutRef);
      };
    }
  }, [step, formData.agentName]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const alt = position.coords.altitude || 0;
            
            const exifObj = {
              "0th": {
                [piexif.ImageIFD.DateTime]: new Date().toISOString()
              },
              "GPS": {
                [piexif.GPSIFD.GPSLatitudeRef]: lat < 0 ? 'S' : 'N',
                [piexif.GPSIFD.GPSLatitude]: degToDmsRational(Math.abs(lat)),
                [piexif.GPSIFD.GPSLongitudeRef]: lng < 0 ? 'W' : 'E',
                [piexif.GPSIFD.GPSLongitude]: degToDmsRational(Math.abs(lng)),
                [piexif.GPSIFD.GPSAltitudeRef]: alt < 0 ? 1 : 0,
                [piexif.GPSIFD.GPSAltitude]: [Math.round(Math.abs(alt) * 100), 100]
              }
            };
            const exifbytes = piexif.dump(exifObj);
            const newImageSrc = piexif.insert(exifbytes, imageSrc);
            setCapturedImage(newImageSrc);
            setStep(3);
          },
          (err) => {
            console.error("GPS error on capture", err);
            setCapturedImage(imageSrc);
            setStep(3);
          },
          { enableHighAccuracy: formData.confidence === 'high' }
        );
      } catch (e) {
        console.error("Exif injection failed", e);
        setCapturedImage(imageSrc);
        setStep(3);
      }
    }
  }, [webcamRef, formData.confidence]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const timestamp = new Date().toISOString();
      let lat = 5.7456; 
      let lng = -0.3214;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: formData.confidence === 'high',
            timeout: 5000 
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (e) {
        console.warn("GPS failed, using site default", e);
      }

      const recordId = uuidv4();
      
      await database.write(async () => {
        const syncQueueCollection = database.get<SyncQueue>('sync_queue');
        const satFarmMetrics = database.get<SatFarmMetrics>('sat_farm_metrics');
        
        const metadataPayload = {
          participant_name: formData.personName,
          board_id: formData.bridgeNumber,
          action_type: formData.actionType,
          status: 'hardened',
          site: formData.siteName,
          gps_lat: lat,
          gps_lng: lng,
          confidence: formData.confidence,
          created_at: timestamp
        };

        await satFarmMetrics.create(record => {
          record.farmId = formData.bridgeNumber;
          record.encryptedPayload = encryptPayload(metadataPayload);
          record.createdAt = Date.now();
        });

        // Priority 1: Metadata
        await syncQueueCollection.create(record => {
          record.encryptedPayload = encryptPayload({ type: 'metadata', data: { ...metadataPayload, id: recordId } });
          record.priority = 1;
          record.status = 'PENDING';
          record.createdAt = Date.now();
          record.retryCount = 0;
          record.idempotencyKey = recordId + '_meta';
        });

        // Priority 2: Media
        if (capturedImage) {
          await syncQueueCollection.create(record => {
            record.encryptedPayload = encryptPayload({ 
              type: 'media', 
              file: capturedImage,
              filename: `photo_${recordId}.jpg`,
              metadata: { gps_lat: lat, gps_lng: lng, parent_id: recordId }
            });
            record.priority = 2;
            record.status = 'PENDING';
            record.createdAt = Date.now();
            record.retryCount = 0;
            record.idempotencyKey = recordId + '_media';
          });
        }
      });

      const newRecord = {
        ...formData,
        image: capturedImage,
        timestamp,
        gps: [lat, lng],
        id: recordId
      };

      setHistory(prev => [newRecord, ...prev].slice(0, 10));
      
      if (onScanComplete) {
        onScanComplete({ ...newRecord });
      }

      setStep(4);
    } catch (error: any) {
      console.error('Error saving scan:', error);
      alert('Database error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetScanner = () => {
    setStep(1); 
    setAccuracy(137);
    setIsLocked(false);
    setCapturedImage(null);
    setFormData(prev => ({
      ...prev,
      personName: '',
      bridgeNumber: '',
      phoneNumber: '',
      actionType: 'firewood_avoidance',
      confidence: 'high'
    }));
  };

  const handleCameraError = (err: string | DOMException) => {
    console.error("Webcam init error", err);
    audioGuidance.play('CAMERA_ERROR');
    // Release memory and force remount to gracefully recover
    setTimeout(() => {
      setCameraKey(prev => prev + 1);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_380px] gap-[14px]">
      <div className="bg-surf border border-border rounded-[10px] overflow-hidden flex flex-col min-h-[650px]">
        <div className="p-3 px-4 border-b border-border flex items-center gap-2 text-[12px] font-medium">
          <Camera size={14} strokeWidth={2.5} className="text-muted" />
          Data Vault Field Audit — {step === 0 ? t('scanner.agent_setup') : `Step ${step}`}
          <span className="text-muted text-[10px] ml-auto font-normal">{t('scanner.ready')}</span>
        </div>

        <div className="p-8 flex-1 flex flex-col">
          <div className="flex gap-1.5 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i < step ? 'bg-green-custom' : i === step ? 'bg-green-custom/40 overflow-hidden' : 'bg-surf2'
                }`}
              >
                {i === step && (
                  <div className="h-full bg-green-custom animate-progress-fast shadow-[0_0_8px_rgba(0,135,90,0.5)]"></div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
            
            {step === 1 && formData.agentName === '' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full text-left">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-blue-custom/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-custom/20">
                    <User className="text-blue-custom" size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[20px] font-bold">{t('scanner.field_id')}</h3>
                  <p className="text-[13px] text-muted">{t('scanner.identify')}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5">{t('scanner.your_name')}</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      className="w-full bg-surf2 border border-border rounded-xl px-4 py-4 text-[14px] outline-none focus:border-blue-custom transition-all"
                      onChange={e => setFormData({...formData, agentName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5">{t('scanner.site')}</label>
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
                  <div className="mt-0.5"><Lock size={14} strokeWidth={2.5} className="text-amber-custom" /></div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {t('scanner.lock_warning')}
                  </p>
                </div>
              </div>
            )}

            {step === 1 && formData.agentName !== '' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <h3 className="text-[20px] font-bold mb-2">{t('scanner.step1')}</h3>
                <p className="text-[13px] text-muted mb-8">{t('scanner.verifying')}</p>

                <div className="w-full bg-surf2 border border-border rounded-2xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-40 h-40 border-2 border-green-custom rounded-full animate-ping"></div>
                  </div>
                  <div className={`mb-4 transition-transform duration-500 ${isLocked ? 'scale-110' : 'animate-bounce'}`}>
                    {isLocked ? (
                      <div className="w-16 h-16 bg-gdim rounded-full flex items-center justify-center border border-green-custom/30 shadow-[0_0_20px_rgba(0,135,90,0.2)]">
                        <CheckCircle className="text-green-custom" size={32} strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-surf2 rounded-full flex items-center justify-center border border-border shadow-inner">
                        <Search className="text-amber-custom animate-pulse" size={32} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="text-[14px] font-bold mb-1">
                    {isLocked ? <span className="text-green-custom">{t('scanner.gps_verified')} {formData.confidence === 'low' && '(Low Acc)'}</span> : <span className="text-amber-custom">{t('scanner.searching')} ({accuracy}m)</span>}
                  </div>
                </div>

                <button disabled={!isLocked} onClick={() => setStep(2)} className="w-full mt-6 py-4 min-h-[48px] rounded-xl bg-green-custom text-white font-bold text-[15px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
                  {t('scanner.proceed_camera')} <Zap size={16} strokeWidth={2.5} fill="currentColor" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                <h3 className="text-[20px] font-bold mb-2">{t('scanner.step2')}</h3>
                <p className="text-[13px] text-muted mb-6">{t('scanner.align')}</p>

                <div className="w-full aspect-video bg-black rounded-2xl border-2 border-green-custom/50 overflow-hidden relative shadow-2xl">
                  <Webcam 
                    key={cameraKey}
                    onUserMediaError={handleCameraError}
                    audio={false} 
                    ref={webcamRef} 
                    screenshotFormat="image/jpeg" 
                    screenshotQuality={0.70} 
                    videoConstraints={{ width: 1600, height: 1200, facingMode: "environment" }} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none flex items-center justify-center">
                    <div className="w-1/2 h-1/2 border-2 border-dashed border-green-custom/40 rounded-xl"></div>
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <button onClick={capture} className="w-16 h-16 min-h-[48px] min-w-[48px] bg-white rounded-full border-4 border-green-custom flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                      <div className="w-12 h-12 bg-green-custom rounded-full flex items-center justify-center"><Camera size={24} strokeWidth={2.5} className="text-white" /></div>
                    </button>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="mt-6 min-h-[48px] text-[11px] text-muted hover:text-red-custom transition-colors flex items-center gap-1 mx-auto">
                  <XCircle size={12} strokeWidth={2.5} /> {t('scanner.cancel')}
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg border border-border overflow-hidden">
                    <img src={capturedImage!} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold">{t('scanner.step3')}</h3>
                    <p className="text-[11px] text-muted uppercase tracking-wider">{t('scanner.linking')}</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5"><User size={10} strokeWidth={2.5} /> {t('scanner.person_name')}</label>
                      <input required type="text" value={formData.personName} onChange={e => setFormData({...formData, personName: e.target.value})} className="w-full bg-surf2 border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-green-custom transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5"><Hash size={10} strokeWidth={2.5} /> {t('scanner.bridge_id')}</label>
                      <input required type="text" value={formData.bridgeNumber} onChange={e => setFormData({...formData, bridgeNumber: e.target.value})} className="w-full bg-surf2 border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-green-custom transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5"><Phone size={10} strokeWidth={2.5} /> {t('scanner.phone')}</label>
                      <input required type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full bg-surf2 border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-green-custom transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase font-bold tracking-widest flex items-center gap-1.5"><MapPin size={10} strokeWidth={2.5} /> {t('scanner.audit_site')}</label>
                      <div className="w-full bg-surf2/50 border border-border rounded-xl px-4 py-3 text-[13px] text-muted">
                        {formData.siteName}
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={isSaving} className="w-full min-h-[48px] bg-green-custom text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50">
                    {isSaving ? <><RefreshCw className="animate-spin" size={18} strokeWidth={2.5} /> {t('scanner.storing')}</> : <><Save size={18} strokeWidth={2.5} /> {t('scanner.commit')}</>}
                  </button>
                </form>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-gdim rounded-full flex items-center justify-center mx-auto mb-6 border border-green-custom/20">
                  <CheckCircle className="text-green-custom" size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-[24px] font-bold mb-2">{t('scanner.audit_stored')}</h3>
                <p className="text-[13px] text-muted mb-8 leading-relaxed">
                  {t('scanner.record_secured')}
                </p>

                <div className="bg-surf2 border border-border rounded-2xl p-6 mb-8 text-left space-y-3">
                  <div className="flex justify-between text-[11px]"><span className="text-muted">Bridge ID</span><span className="font-bold">{formData.bridgeNumber}</span></div>
                  <div className="flex justify-between text-[11px]"><span className="text-muted">GPS Lock</span><span className="text-green-custom font-bold">MATCH</span></div>
                  <div className="flex justify-between text-[11px]"><span className="text-muted">{t('scanner.vault_status')}</span><span className="text-blue-custom font-bold italic">HARDENED</span></div>
                </div>

                <button onClick={resetScanner} className="w-full min-h-[48px] bg-green-custom text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
                  <RefreshCw size={18} strokeWidth={2.5} /> {t('scanner.new_audit')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[14px]">
        <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium flex justify-between items-center">
            {t('scanner.history')}
          </div>
          {history.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center opacity-30">
              <Camera size={24} strokeWidth={2.5} className="mb-2" />
              <p className="text-[11px]">{t('scanner.no_records')}</p>
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
      </div>

      <style jsx>{`
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-progress-fast { animation: progress 1.5s infinite linear; }
      `}</style>
    </div>
  );
}
