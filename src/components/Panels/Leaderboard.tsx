import { LeaderboardEntry } from '@/hooks/useVaultData';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  isAdmin?: boolean;
}

export default function Leaderboard({ entries, loading, isAdmin }: LeaderboardProps) {
  const medals = ['#f4c430', '#c0c0c0', '#cd7f32'];
  
  const Skeleton = () => (
    <div className="flex items-center gap-2.5 py-2 border-b border-[rgba(255,255,255,0.04)]">
      <div className="w-6 h-6 rounded-full bg-surf2 animate-pulse shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 bg-surf2 rounded animate-pulse"></div>
        <div className="h-2 w-1/2 bg-surf2 rounded animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_380px] gap-[14px]">
      <div className="bg-surf border border-border rounded-[10px] overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-3 px-4 border-b border-border text-[12px] font-medium flex items-center gap-2 shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M 6.5 1 L 8 5 H 12 L 9 7.5 L 10 11.5 L 6.5 9 L 3 11.5 L 4 7.5 L 1 5 H 5 L 6.5 1 Z" fill="#f4c430"/>
          </svg>
          Community champion leaderboard — Week 4
          <span className="text-muted text-[10px] ml-auto font-normal">Live updates from Supabase</span>
        </div>
        
        <div className="px-4 py-2 flex-1 overflow-y-auto">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : entries.length === 0 ? (
            <div className="py-10 text-center text-muted text-xs">No participants found.</div>
          ) : (
            entries.map((p, i) => {
              const mc = medals[p.rank - 1] || 'var(--color-muted)';
              const textC = p.rank <= 3 ? '#111' : 'var(--color-muted)';
              
              return (
                <div key={p.rank || i} className="flex items-center gap-2.5 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: mc, color: textC }}>
                    {p.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium">{p.name}</div>
                    <div className="text-[10px] text-muted">{p.site}</div>
                    <div className="h-[3px] bg-surf2 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-green-custom rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (p.pts / 200) * 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-green-custom">{p.pts}</div>
                    <div className="text-[10px] text-muted uppercase tracking-widest">pts</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 px-4 border-t border-border bg-[rgba(16,217,126,0.06)] shrink-0">
          <div className="text-[11px] font-semibold text-green-custom uppercase tracking-wide">Next group payout — Friday 18 Apr</div>
          <div className="text-[11px] text-muted mt-0.5">Calculated based on hardened scans.</div>
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

        <div className="bg-surf border border-border rounded-[10px] overflow-hidden p-4">
          <div className="bg-surf2 rounded-lg p-4 text-center">
            {isAdmin ? (
              <>
                <div className="text-[22px] font-bold text-green-custom leading-tight">100 pts</div>
                <div className="text-[11px] text-muted mt-1 uppercase tracking-widest">= GHS 5.00 Payout</div>
              </>
            ) : (
              <>
                <div className="text-[18px] font-bold text-blue-custom leading-tight">Community Impact</div>
                <div className="text-[11px] text-muted mt-1 uppercase tracking-widest">Points = Support</div>
              </>
            )}
          </div>
          <p className="text-[11px] text-muted mt-3 leading-relaxed">
            {isAdmin 
              ? "Payments are processed via MTN MoMo and Telecel once threshold is reached."
              : "Every scan you make builds community health and carbon avoidance credits."}
          </p>
        </div>
      </div>
    </div>
  );
}

