interface MetricCardsProps {
  metrics: {
    scansToday: number;
    verificationRate: number;
    co2Avoided: number;
    payoutsSent: number;
    activeParticipants: number;
  };
  loading: boolean;
}

export default function MetricCards({ metrics, loading }: MetricCardsProps) {
  const Skeleton = () => <div className="h-7 w-20 bg-surf2 rounded animate-pulse mb-1"></div>;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
          Scans today
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#10d97e" strokeWidth="1.2"/>
            <path d="M 6 4 V 7 M 6 8.5 V 9" stroke="#10d97e" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        {loading ? <Skeleton /> : (
          <div className="text-[26px] font-bold leading-none text-green-custom">{metrics.scansToday}</div>
        )}
        <div className="text-[11px] text-muted mt-1.5">+0 since last hour · 0 flagged</div>
      </div>
      
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
          Verification rate
        </div>
        {loading ? <Skeleton /> : (
          <div className="text-[26px] font-bold leading-none text-blue-custom">{metrics.verificationRate}%</div>
        )}
        <div className="text-[11px] text-muted mt-1.5">Triple-factor pass rate</div>
      </div>
      
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
          CO₂ avoided (kg)
        </div>
        {loading ? <Skeleton /> : (
          <div className="text-[26px] font-bold leading-none text-amber-custom">{metrics.co2Avoided.toLocaleString()}</div>
        )}
        <div className="text-[11px] text-muted mt-1.5">{metrics.activeParticipants} active participants</div>
      </div>
      
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
          Payouts sent
        </div>
        {loading ? <Skeleton /> : (
          <div className="text-[26px] font-bold leading-none text-purple-custom">GHS {metrics.payoutsSent.toFixed(2)}</div>
        )}
        <div className="text-[11px] text-muted mt-1.5">MTN & Telecel MoMo</div>
      </div>
    </div>
  );
}

