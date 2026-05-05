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

export default function ProvostPortal() {
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-15');

  const exportCsv = () => {
    const headers = ['date','participant','site','meal','protein_g','kcal','nutrition_score','researcher_verified'];
    const rows = nutritionRows.map(r => [r.date, r.name, r.site, `"${r.meal}"`, r.protein, r.kcal, r.score, r.verified].join(','));
    const csv = [headers.join(',')].concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carbon_clarity_nutrition.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[13px] font-semibold">Provost Research Hub</span>
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
            className="bg-gdim border border-[rgba(16,217,126,0.3)] rounded-lg px-3.5 py-1.5 text-[12px] font-semibold text-green-custom hover:bg-[rgba(16,217,126,0.2)] transition-colors"
          >
            ⬇ Export CSV
          </button>
        </div>
      </div>

      <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
        <div className="p-3 px-4 border-b border-border text-[12px] font-medium">
          REST API endpoint — academic export
        </div>
        <div className="p-4">
          <div className="bg-surf2 border border-border rounded-lg p-3.5 px-4 font-mono text-[11px] leading-[1.7] text-text overflow-x-auto whitespace-pre">
            <span className="text-blue-custom">GET</span> /api/v1/nutrition<br/>
            &nbsp;&nbsp;?site=<span className="text-green-custom">berekuso-farm-a</span><br/>
            &nbsp;&nbsp;&amp;from=<span className="text-green-custom">2026-04-01</span><br/>
            &nbsp;&nbsp;&amp;to=<span className="text-green-custom">2026-04-15</span><br/>
            &nbsp;&nbsp;&amp;format=<span className="text-green-custom">csv</span> <span className="text-muted">/* or json */</span><br/>
            &nbsp;&nbsp;Authorization: Bearer &lt;provost-api-key&gt;<br/><br/>
            <span className="text-green-custom">Response 200</span> → {'{'} scans[], nutrition_scores[], aggregate{'{}{}'} {'}'}
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
          Food & nutrition log
          <span className="text-muted text-[10px] ml-auto font-normal">5 records shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Date</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Participant</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Site</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Meal</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Protein (g)</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Kcal</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Score</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Verified</th>
              </tr>
            </thead>
            <tbody>
              {nutritionRows.map((r, i) => (
                <tr key={i} className="hover:bg-[rgba(255,255,255,0.015)] border-b border-[rgba(255,255,255,0.03)] last:border-0">
                  <td className="p-2 px-3 text-muted">{r.date}</td>
                  <td className="p-2 px-3 font-medium">{r.name}</td>
                  <td className="p-2 px-3">{r.site}</td>
                  <td className="p-2 px-3">{r.meal}</td>
                  <td className="p-2 px-3">{r.protein}</td>
                  <td className="p-2 px-3">{r.kcal}</td>
                  <td className="p-2 px-3 font-bold" style={{ color: r.score >= 80 ? 'var(--color-green-custom)' : r.score >= 70 ? 'var(--color-blue-custom)' : 'var(--color-amber-custom)' }}>
                    {r.score}
                  </td>
                  <td className="p-2 px-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-[0.3px] ${r.verified ? 'bg-gdim text-green-custom' : 'bg-adim text-amber-custom'}`}>
                      {r.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
