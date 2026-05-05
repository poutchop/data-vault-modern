'use client';

import { useState, useEffect } from 'react';

const initialFeedData = [
  {name:'Akosua Mensah', board:'014', site:'Farm A', action:'firewood_avoidance', status:'hardened', time:'09:42'},
  {name:'Abena Owusu',   board:'007', site:'Farm B', action:'nutrition_meal',    status:'hardened', time:'09:38'},
  {name:'Efua Darko',    board:'021', site:'Co-op W',action:'firewood_avoidance', status:'flagged',  time:'09:31'},
  {name:'Ama Asante',    board:'003', site:'Farm A', action:'firewood_avoidance', status:'hardened', time:'09:27'},
  {name:'Adwoa Boateng', board:'019', site:'Farm B', action:'nutrition_meal',    status:'hardened', time:'09:19'},
  {name:'Yaa Frimpong',  board:'011', site:'Co-op W',action:'firewood_avoidance', status:'rejected', time:'09:15'},
  {name:'Akua Nkrumah',  board:'006', site:'Farm A', action:'nutrition_meal',    status:'hardened', time:'09:08'},
  {name:'Serwa Adjei',   board:'002', site:'Farm A', action:'solar_drying',      status:'hardened', time:'09:01'},
  {name:'Araba Quaye',   board:'017', site:'Farm B', action:'nutrition_meal',    status:'hardened', time:'08:55'},
  {name:'Akosua Mensah', board:'014', site:'Farm A', action:'firewood_avoidance', status:'hardened', time:'08:48'},
];

const extraNames = ['Efua Darko','Serwa Adjei','Araba Quaye','Adwoa Mensah','Aba Koomson'];
const extraActions = ['firewood_avoidance','nutrition_meal','solar_drying'];

export default function HardeningFeed() {
  const [feedData, setFeedData] = useState(initialFeedData);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const newScan = {
        name: extraNames[Math.floor(Math.random() * extraNames.length)],
        board: String(Math.floor(Math.random() * 30) + 1).padStart(3, '0'),
        site: ['Farm A', 'Farm B', 'Co-op W'][Math.floor(Math.random() * 3)],
        action: extraActions[Math.floor(Math.random() * extraActions.length)],
        status: Math.random() > 0.12 ? 'hardened' : 'flagged',
        time: hh + ':' + mm,
      };
      setFeedData((prev) => [newScan, ...prev]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
      <div className="p-3 px-4 border-b border-border flex items-center gap-2 text-[12px] font-medium">
        <div className="w-1.5 h-1.5 rounded-full bg-green-custom animate-pulse"></div>
        Real-time hardening feed
        <span className="text-muted text-[10px] ml-auto">Auto-refreshes · QR · GPS · Time</span>
      </div>
      <div className="px-4 max-h-[420px] overflow-y-auto">
        {feedData.slice(0, 12).map((f, i) => {
          const dotCls = f.status === 'hardened' ? 'bg-green-custom' : f.status === 'flagged' ? 'bg-amber-custom' : 'bg-red-custom';
          const badgeCls = f.status === 'hardened' ? 'bg-gdim text-green-custom' : f.status === 'flagged' ? 'bg-adim text-amber-custom' : 'bg-[rgba(255,90,90,0.12)] text-red-custom';
          const action = f.action.replace(/_/g, ' ');

          return (
            <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
              <div className={`w-[7px] h-[7px] rounded-full mt-1 shrink-0 ${dotCls}`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium">
                  {f.name} <span className="text-muted font-normal text-[11px]">#{f.board}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded ml-1 text-[10px] font-bold tracking-[0.3px] ${badgeCls}`}>{f.status}</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded ml-1 text-[10px] font-bold tracking-[0.3px] bg-bdim text-blue-custom capitalize">{action}</span>
                </div>
                <div className="text-[11px] text-muted mt-0.5">{f.site} · GPS: 5.7456°N 0.3214°W · Δt 4s</div>
                <div className="flex gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{background: f.status !== 'rejected' ? 'var(--color-green-custom)' : 'var(--color-red-custom)'}} title="QR"></div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{background: f.status === 'hardened' ? 'var(--color-green-custom)' : f.status === 'flagged' ? 'var(--color-amber-custom)' : 'var(--color-red-custom)'}} title="GPS"></div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{background: 'var(--color-green-custom)'}} title="Time"></div>
                </div>
              </div>
              <div className="text-[10px] text-muted whitespace-nowrap ml-auto shrink-0">{f.time}</div>
            </div>
          );
        })}
      </div>
      <div className="py-2 px-4 border-t border-border text-[10px] text-muted">
        Showing latest 40 scans · new entries appear automatically
      </div>
    </div>
  );
}
