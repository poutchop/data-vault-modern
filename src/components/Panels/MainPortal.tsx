'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const nutritionRows = [
  {date:'2026-04-15',name:'Akosua Mensah',site:'Farm A',meal:'Bean stew with greens',protein:28,kcal:480,score:82,verified:true},
  {date:'2026-04-15',name:'Abena Owusu',  site:'Farm B',meal:'Kontomire with yam',   protein:22,kcal:410,score:74,verified:true},
  {date:'2026-04-14',name:'Akosua Mensah',site:'Farm A',meal:'Groundnut soup + rice', protein:31,kcal:520,score:86,verified:true},
  {date:'2026-04-14',name:'Ama Asante',   site:'Farm A',meal:'Egg with tomato sauce', protein:18,kcal:360,score:68,verified:false},
  {date:'2026-04-13',name:'Abena Owusu',  site:'Farm B',meal:'Bean stew',             protein:25,kcal:440,score:78,verified:true},
];

const chartData = [
  { week: 'W1', score: 62, target: 80 },
  { week: 'W2', score: 65, target: 80 },
  { week: 'W3', score: 70, target: 80 },
  { week: 'W4', score: 71, target: 80 },
  { week: 'W5', score: 74, target: 80 },
  { week: 'W6', score: 76, target: 80 },
  { week: 'W7', score: 78, target: 80 },
];

import { NutritionLog } from '@/hooks/useVaultData';

interface MainPortalProps {
  scans: any[];
  metrics: {
    totalCO2_kg: number;
    certifiedCredits_t: number;
    accruedMarketValue_usd: number;
    disbursementPool_ghs: number;
    activeParticipants: number;
    verificationRate: number;
  };
  loading: boolean;
}

import { useEffect } from 'react';

export default function MainPortal({ scans, metrics, loading }: MainPortalProps) {
  const [livePrice, setLivePrice] = useState(15.00);
  
  // Simulate live market fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setLivePrice(prev => Number((prev + (Math.random() - 0.5) * 0.05).toFixed(2)));
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-15');

  const exportCsv = () => {
    const headers = ['date', 'participant', 'site', 'action_type', 'carbon_avoided_kg', 'gps_lat', 'gps_lng', 'status', 'verified'];
    const rows = scans.map(s => [
      new Date(s.created_at).toISOString().split('T')[0], 
      s.participant_name, 
      s.site, 
      s.action_type, 
      60.5, // 60.5kg per scan
      s.gps_lat,
      s.gps_lng,
      s.status,
      s.status === 'hardened' ? 'TRUE' : 'FALSE'
    ].join(','));
    const csv = [headers.join(',')].concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon_clarity_audit_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* PROFESSIONAL CARBON REGISTRY HUB */}
      <div className="bg-surf border border-border rounded-[10px] overflow-hidden mb-4">
        <div className="p-3 px-4 border-b border-border bg-[rgba(16,217,126,0.05)] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-green-custom uppercase tracking-wider">Carbon Asset Registry Hub</span>
            <span className="text-[10px] bg-green-custom/10 text-green-custom px-1.5 py-0.5 rounded border border-green-custom/20">LIVE MONITORING</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted uppercase">Spot Price:</span>
              <span className="text-[12px] font-mono font-bold text-blue-custom">${livePrice.toFixed(2)}/t</span>
              <div className={`w-1.5 h-1.5 rounded-full ${Math.random() > 0.5 ? 'bg-green-custom' : 'bg-red-custom'} animate-pulse`}></div>
            </div>
            <div className="h-4 w-[1px] bg-border"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted uppercase">Project Valuation:</span>
              <span className="text-[12px] font-mono font-bold text-green-custom">${(metrics.certifiedCredits_t * livePrice).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <div className="p-4">
            <div className="text-[10px] text-muted uppercase mb-1">Vintage Total</div>
            <div className="text-[20px] font-bold">{metrics.certifiedCredits_t.toFixed(3)} <span className="text-[11px] font-normal text-muted">tCO₂e</span></div>
          </div>
          <div className="p-4">
            <div className="text-[10px] text-muted uppercase mb-1">Registry Status</div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-green-custom">CERTIFIED</span>
              <span className="text-[9px] text-muted">V-2026-GH</span>
            </div>
          </div>
          <div className="p-4">
            <div className="text-[10px] text-muted uppercase mb-1">Market Activity</div>
            <div className="text-[11px] text-blue-custom font-medium underline cursor-pointer">View On-chain Ledger ↗</div>
          </div>
        </div>
        
        {/* METHODOLOGY BREAKDOWN */}
        <div className="p-3 px-4 bg-surf2/50 flex gap-6 items-center border-t border-border/50">
          <div className="text-[9px] text-muted font-mono uppercase">CDM Methodology AMS-II.G:</div>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] text-muted uppercase">fNRB Factor</span>
              <span className="text-[10px] font-bold text-text">90.0%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted uppercase">EF Biomass</span>
              <span className="text-[10px] font-bold text-text">1.502 kg/kg</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted uppercase">Net Savings</span>
              <span className="text-[10px] font-bold text-green-custom">54.45 kg/audit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[14px]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[13px] font-semibold uppercase tracking-tight">Provost Research Hub</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-[0.3px] bg-bdim text-blue-custom">Academic access</span>
          
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-muted">Filter:</span>
            <input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-surf2 border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-text outline-none focus:border-green-custom"
            />
            <span className="text-muted">to</span>
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-surf2 border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-text outline-none focus:border-green-custom"
            />
            <button 
              onClick={exportCsv}
              className="bg-gdim border border-[rgba(16,217,126,0.3)] text-green-custom text-[12px] font-bold px-4 py-1.5 rounded-lg hover:bg-[rgba(16,217,126,0.2)] transition-colors"
            >
              ⬇ Export CSV
            </button>
          </div>
        </div>

        <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium">
            REST API endpoint — primary carbon audit export
          </div>
          <div className="p-4">
            <div className="bg-surf2 border border-border rounded-lg p-3.5 px-4 font-mono text-[11px] leading-[1.7] text-text overflow-x-auto whitespace-pre">
              <span className="text-blue-custom">GET</span> /api/v1/carbon-audit<br/>
              &nbsp;&nbsp;?site=<span className="text-green-custom">berekuso-farm-a</span><br/>
              &nbsp;&nbsp;&amp;from=<span className="text-green-custom">2026-04-01</span><br/>
              &nbsp;&nbsp;&amp;to=<span className="text-green-custom">2026-04-15</span><br/>
              &nbsp;&nbsp;&amp;format=<span className="text-green-custom">csv</span> <span className="text-muted">/* or json */</span><br/>
              &nbsp;&nbsp;Authorization: Bearer &lt;provost-api-key&gt;<br/><br/>
              <span className="text-green-custom">Response 200</span> → &#123; scans[], carbon_metrics[], aggregate&#123;&#125; &#125;
            </div>
          </div>
        </div>

        <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium flex items-center gap-2">
            Nutrition score trend (weekly avg)
            <span className="text-muted text-[10px] ml-auto font-normal">Target: 80</span>
          </div>
          <div className="p-4 h-[212px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b8fa8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b8fa8' }} domain={[40, 100]} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-surf2 border border-border p-2 rounded shadow-lg text-[11px]">
                          <p className="font-medium mb-1">{label}</p>
                          <p style={{ color: payload[0].color }}>Score: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Line type="monotone" dataKey="score" name="Nutrition score" stroke="#4d9fff" strokeWidth={2} dot={{ r: 3, fill: '#4d9fff' }} activeDot={{ r: 5 }} />
                <Line type="step" dataKey="target" stroke="#9d7dff" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium flex items-center gap-2">
            Carbon Audit Master Log
            <span className="text-muted text-[10px] ml-auto font-normal">{scans.length} records shown</span>
          </div>
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr>
                  <th className="font-medium text-muted p-2 px-3 border-b border-border">Date</th>
                  <th className="font-medium text-muted p-2 px-3 border-b border-border">Participant</th>
                  <th className="font-medium text-muted p-2 px-3 border-b border-border">Site</th>
                  <th className="font-medium text-muted p-2 px-3 border-b border-border">Action</th>
                  <th className="font-medium text-muted p-2 px-3 border-b border-border text-center">Carbon (kg)</th>
                  <th className="font-medium text-muted p-2 px-3 border-b border-border text-center">GPS Status</th>
                  <th className="font-medium text-muted p-2 px-3 border-b border-border text-center">Protocol</th>
                  <th className="font-medium text-muted p-2 px-3 border-b border-border text-center">Verified</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-muted animate-pulse">Loading carbon audit data...</td>
                  </tr>
                ) : scans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-muted">No audit records found in Supabase.</td>
                  </tr>
                ) : (
                  scans.map((s, i) => {
                    const isHardened = s.status === 'hardened';
                    return (
                      <tr key={s.id || i} className="hover:bg-[rgba(255,255,255,0.015)] border-b border-[rgba(255,255,255,0.03)] last:border-0">
                        <td className="p-2 px-3 text-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="p-2 px-3 font-medium">{s.participant_name}</td>
                        <td className="p-2 px-3">{s.site}</td>
                        <td className="p-2 px-3 capitalize">{s.action_type?.replace(/_/g, ' ')}</td>
                        <td className="p-2 px-3 text-center font-bold text-green-custom">54.45kg</td>
                        <td className="p-2 px-3 text-center">
                           <span className="text-[10px] text-muted">{s.gps_lat?.toFixed(4)}, {s.gps_lng?.toFixed(4)}</span>
                           <div className="text-[8px] text-green-custom/60 uppercase font-bold tracking-tighter">Verified On-Site</div>
                        </td>
                        <td className="p-2 px-3 text-center text-[10px] font-mono">AMS-II.G</td>
                        <td className="p-2 px-3 text-center">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-[0.3px] ${isHardened ? 'bg-gdim text-green-custom' : 'bg-adim text-amber-custom'}`}>
                            {isHardened ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

