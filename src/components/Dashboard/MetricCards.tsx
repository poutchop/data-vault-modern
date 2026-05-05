interface MetricCardsProps {
  metrics: {
    scansToday: number;
    verificationRate: number;
    co2Avoided: number;
    payoutsSent: number;
    activeParticipants: number;
    totalPoints?: number;
  };
  loading: boolean;
  isAdmin?: boolean;
}

export default function MetricCards({ metrics, loading, isAdmin }: MetricCardsProps) {
  const Skeleton = () => <div className="h-7 w-20 bg-surf2 rounded animate-pulse mb-1"></div>;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* CARD 1: SCANS TODAY (Everyone sees) */}
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
          My Scans Today
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#10d97e" strokeWidth="1.2"/>
            <path d="M 6 4 V 7 M 6 8.5 V 9" stroke="#10d97e" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        {loading ? <Skeleton /> : (
          <div className="text-[26px] font-bold leading-none text-green-custom">{metrics.scansToday}</div>
        )}
        <div className="text-[11px] text-muted mt-1.5">{isAdmin ? '+0 since last hour' : 'Keep up the good work!'}</div>
      </div>
      
      {/* CARD 2: DYNAMIC (Admin: Verification Rate | Agent: Community Points) */}
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">
          {isAdmin ? 'Verification Rate' : 'Total Points'}
        </div>
        {loading ? <Skeleton /> : (
          <div className={`text-[26px] font-bold leading-none ${isAdmin ? 'text-blue-custom' : 'text-purple-custom'}`}>
            {isAdmin ? `${metrics.verificationRate}%` : `${(metrics.scansToday * 3).toLocaleString()}`}
          </div>
        )}
        <div className="text-[11px] text-muted mt-1.5">{isAdmin ? 'Triple-factor pass rate' : 'Redeemable for GHS'}</div>
      </div>
      
      {/* CARD 3: DYNAMIC (Admin: CO2 Avoided | Agent: Project Progress) */}
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">
          {isAdmin ? 'CO₂ Avoided (kg)' : 'Project Status'}
        </div>
        {loading ? <Skeleton /> : (
          <div className={`text-[26px] font-bold leading-none ${isAdmin ? 'text-amber-custom' : 'text-green-custom'}`}>
            {isAdmin ? metrics.co2Avoided.toLocaleString() : 'ACTIVE'}
          </div>
        )}
        <div className="text-[11px] text-muted mt-1.5">{isAdmin ? `${metrics.activeParticipants} active participants` : 'Pilot Phase 1'}</div>
      </div>
      
      {/* CARD 4: DYNAMIC (Admin: Payouts Sent | Agent: My Rank) */}
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">
          {isAdmin ? 'Payouts Sent' : 'Field Ranking'}
        </div>
        {loading ? <Skeleton /> : (
          <div className={`text-[26px] font-bold leading-none ${isAdmin ? 'text-purple-custom' : 'text-blue-custom'}`}>
            {isAdmin ? `GHS ${metrics.payoutsSent.toFixed(2)}` : '#1'}
          </div>
        )}
        <div className="text-[11px] text-muted mt-1.5">{isAdmin ? 'MTN & Telecel MoMo' : 'Top Contributor'}</div>
      </div>
    </div>
  );
}

