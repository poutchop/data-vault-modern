'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { week: 'W1', co2: 210, baseline: 180, bundles: 14 },
  { week: 'W2', co2: 285, baseline: 180, bundles: 19 },
  { week: 'W3', co2: 320, baseline: 180, bundles: 21 },
  { week: 'W4', co2: 410, baseline: 180, bundles: 27 },
  { week: 'W5', co2: 388, baseline: 180, bundles: 26 },
  { week: 'W6', co2: 447, baseline: 180, bundles: 30 },
  { week: 'W7', co2: 520, baseline: 180, bundles: 35 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surf2 border border-border p-2 rounded shadow-lg text-[11px]">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ClimateAnalytics() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">
        <div className="lg:col-span-2 bg-surf border border-border rounded-[10px] overflow-hidden">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-green-custom inline-block"></span>
            Firewood avoidance — CO₂ saved (kg/week)
          </div>
          <div className="p-4 h-[212px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b8fa8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b8fa8' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="co2" name="CO₂ avoided" fill="rgba(16,217,126,0.75)" radius={[4, 4, 4, 4]} />
                <Bar dataKey="baseline" name="Baseline" fill="rgba(244,161,52,0.4)" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-amber-custom inline-block"></span>
            Wood bundles saved
          </div>
          <div className="p-4 flex flex-col h-full">
            <div className="h-[120px] mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b8fa8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b8fa8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="bundles" name="Bundles" stroke="#f4a134" strokeWidth={2} dot={{ r: 3, fill: '#f4a134' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="bg-surf2 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-muted">Total bundles</div>
                <div className="text-[18px] font-bold text-amber-custom">172</div>
              </div>
              <div className="bg-surf2 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-muted">Week growth</div>
                <div className="text-[18px] font-bold text-green-custom">+16.7%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
        <div className="p-3 px-4 border-b border-border text-[12px] font-medium">
          Site-level impact summary
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Site</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Participants</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Scans (wk)</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">CO₂ saved</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Avg nutrition</th>
                <th className="font-medium text-muted p-2 px-3 border-b border-border">Payout status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-[rgba(255,255,255,0.015)] border-b border-[rgba(255,255,255,0.03)] last:border-0">
                <td className="p-2 px-3 font-medium">Berekuso Farm A</td>
                <td className="p-2 px-3">7</td>
                <td className="p-2 px-3">49</td>
                <td className="p-2 px-3 text-green-custom font-semibold">842 kg</td>
                <td className="p-2 px-3 text-blue-custom">76.4</td>
                <td className="p-2 px-3"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-[0.3px] bg-gdim text-green-custom">Paid</span></td>
              </tr>
              <tr className="hover:bg-[rgba(255,255,255,0.015)] border-b border-[rgba(255,255,255,0.03)] last:border-0">
                <td className="p-2 px-3 font-medium">Berekuso Farm B</td>
                <td className="p-2 px-3">6</td>
                <td className="p-2 px-3">38</td>
                <td className="p-2 px-3 text-green-custom font-semibold">684 kg</td>
                <td className="p-2 px-3 text-blue-custom">71.8</td>
                <td className="p-2 px-3"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-[0.3px] bg-gdim text-green-custom">Paid</span></td>
              </tr>
              <tr className="hover:bg-[rgba(255,255,255,0.015)] border-b border-[rgba(255,255,255,0.03)] last:border-0">
                <td className="p-2 px-3 font-medium">Tomato Co-op West</td>
                <td className="p-2 px-3">5</td>
                <td className="p-2 px-3">31</td>
                <td className="p-2 px-3 text-amber-custom font-semibold">510 kg</td>
                <td className="p-2 px-3 text-blue-custom">73.2</td>
                <td className="p-2 px-3"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-[0.3px] bg-adim text-amber-custom">Pending</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
