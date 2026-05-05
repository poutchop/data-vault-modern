const lbData = [
  {name:'Akosua Mensah', site:'Farm A', pts:142, pct:100, pay:'11.83', rank:1},
  {name:'Ama Asante',    site:'Farm A', pts:138, pct:97,  pay:'11.50', rank:2},
  {name:'Abena Owusu',   site:'Farm B', pts:131, pct:92,  pay:'10.92', rank:3},
  {name:'Adwoa Boateng', site:'Farm B', pts:119, pct:84,  pay:'9.92',  rank:4},
  {name:'Akua Nkrumah',  site:'Farm A', pts:107, pct:75,  pay:'8.92',  rank:5},
  {name:'Yaa Frimpong',  site:'Co-op W',pts:98,  pct:69,  pay:'8.17',  rank:6},
];

export default function Leaderboard() {
  const medals = ['#f4c430', '#c0c0c0', '#cd7f32'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_380px] gap-[14px]">
      <div className="bg-surf border border-border rounded-[10px] overflow-hidden flex flex-col">
        <div className="p-3 px-4 border-b border-border text-[12px] font-medium flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M 6.5 1 L 8 5 H 12 L 9 7.5 L 10 11.5 L 6.5 9 L 3 11.5 L 4 7.5 L 1 5 H 5 L 6.5 1 Z" fill="#f4c430"/>
          </svg>
          Community champion leaderboard — Week 4
          <span className="text-muted text-[10px] ml-auto font-normal">Auto-refreshes every 30 s</span>
        </div>
        
        <div className="px-4 py-2 flex-1">
          {lbData.map((p) => {
            const mc = medals[p.rank - 1] || 'var(--color-muted)';
            const textC = p.rank <= 3 ? '#111' : 'var(--color-muted)';
            
            return (
              <div key={p.rank} className="flex items-center gap-2.5 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: mc, color: textC }}>
                  {p.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium">{p.name}</div>
                  <div className="text-[10px] text-muted">{p.site}</div>
                  <div className="h-[3px] bg-surf2 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-green-custom rounded-full" style={{ width: `${p.pct}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-bold text-green-custom">{p.pts}</div>
                  <div className="text-[10px] text-muted">pts</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 px-4 border-t border-border bg-[rgba(16,217,126,0.06)]">
          <div className="text-[11px] font-semibold text-green-custom">Next group payout — Friday 18 Apr</div>
          <div className="text-[11px] text-muted mt-0.5">6 participants eligible · GHS 30.00 total · MTN & Telecel</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium">Points key</div>
          <div className="p-4 pb-2">
            <div className="flex justify-between items-center bg-surf2 rounded-lg p-2.5 px-3 mb-1.5 text-[12px]">
              <span>Firewood avoidance scan</span>
              <span className="text-green-custom font-bold">+3 pts</span>
            </div>
            <div className="flex justify-between items-center bg-surf2 rounded-lg p-2.5 px-3 mb-1.5 text-[12px]">
              <span>Nutrition meal logged</span>
              <span className="text-blue-custom font-bold">+2 pts</span>
            </div>
            <div className="flex justify-between items-center bg-surf2 rounded-lg p-2.5 px-3 mb-1.5 text-[12px]">
              <span>Solar drying logged</span>
              <span className="text-amber-custom font-bold">+2 pts</span>
            </div>
            <div className="flex justify-between items-center bg-surf2 rounded-lg p-2.5 px-3 text-[12px]">
              <span>Full week completed</span>
              <span className="text-purple-custom font-bold">+10 bonus</span>
            </div>
          </div>
        </div>

        <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
          <div className="p-3 px-4 border-b border-border text-[12px] font-medium">Payout threshold</div>
          <div className="p-4">
            <div className="bg-surf2 rounded-lg p-3">
              <div className="text-[22px] font-bold text-green-custom">100 pts</div>
              <div className="text-[11px] text-muted mt-1">= GHS 5.00 Mobile Money payout</div>
            </div>
            <div className="mt-2.5 text-[11px] text-muted">
              Paid automatically via MTN MoMo API once threshold is reached and all scans are hardened.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
