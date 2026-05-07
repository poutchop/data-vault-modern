interface MetricCardsProps {
  metrics: {
    totalCO2_kg: number;
    certifiedCredits_t: number;
    accruedMarketValue_usd: number;
    disbursementPool_ghs: number;
    activeParticipants: number;
    verificationRate: number;
    scansToday?: number;
    totalPoints?: number;
  };
  loading: boolean;
  isAdmin?: boolean;
}

export default function MetricCards({ metrics, loading, isAdmin }: MetricCardsProps) {
  const Skeleton = () => <div className="h-7 w-20 bg-surf2 rounded animate-pulse mb-1"></div>;

  if (isAdmin) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CARD 1: CERTIFIED CREDITS (Tonnes) */}
        <div className="bg-surf border border-border rounded-[10px] p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-green-custom"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 11 17 11"/><path d="M13 20a7 7 0 0 0 1.2-13.9C8.5 5 7 11 7 11"/><path d="M12 12v.01"/></svg>
          </div>
          <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
            Certified Credits
            <span className="bg-gdim text-green-custom text-[8px] px-1.5 py-0.5 rounded-full border border-green-custom/20">VINTAGE 2026</span>
          </div>
          {loading ? <Skeleton /> : (
            <div className="text-[26px] font-bold leading-none text-green-custom">{metrics.certifiedCredits_t} <span className="text-[14px] font-normal opacity-70">tCO₂e</span></div>
          )}
          <div className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-custom animate-pulse"></div>
            Registry: Verified
          </div>
        </div>
        
        {/* CARD 2: MARKET VALUATION (USD) */}
        <div className="bg-surf border border-border rounded-[10px] p-4">
          <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">
            Accrued Market Value
          </div>
          {loading ? <Skeleton /> : (
            <div className="text-[26px] font-bold leading-none text-blue-custom">${metrics.accruedMarketValue_usd.toLocaleString()} <span className="text-[12px] font-normal opacity-70 text-muted">USD</span></div>
          )}
          <div className="text-[11px] text-muted mt-1.5">Est. Spot Price: $15/t</div>
        </div>
        
        {/* CARD 3: TOTAL IMPACT (kg) */}
        <div className="bg-surf border border-border rounded-[10px] p-4">
          <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">
            Total CO₂ Avoided
          </div>
          {loading ? <Skeleton /> : (
            <div className="text-[26px] font-bold leading-none text-amber-custom">{metrics.totalCO2_kg.toLocaleString()} <span className="text-[12px] font-normal opacity-70 text-muted">kg</span></div>
          )}
          <div className="text-[11px] text-muted mt-1.5">{metrics.activeParticipants} Field Participants</div>
        </div>
        
        {/* CARD 4: DISBURSEMENT POOL (GHS) */}
        <div className="bg-surf border border-border rounded-[10px] p-4">
          <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
            Disbursement Pool
            <span className="text-purple-custom text-[9px] font-bold">READY</span>
          </div>
          {loading ? <Skeleton /> : (
            <div className="text-[26px] font-bold leading-none text-purple-custom">GHS {metrics.disbursementPool_ghs.toFixed(2)}</div>
          )}
          <div className="text-[11px] text-muted mt-1.5">Scheduled: Quarterly Cycle</div>
        </div>
      </div>
    );
  }

  // AGENT VIEW (Default)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* CARD 1: SCANS TODAY */}
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
          My Scans Today
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#10d97e" strokeWidth="1.2"/>
            <path d="M 6 4 V 7 M 6 8.5 V 9" stroke="#10d97e" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        {loading ? <Skeleton /> : (
          <div className="text-[26px] font-bold leading-none text-green-custom">{metrics.scansToday || 0}</div>
        )}
        <div className="text-[11px] text-muted mt-1.5">Keep up the good work!</div>
      </div>
      
      {/* CARD 2: TOTAL POINTS */}
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">
          Total Points
        </div>
        {loading ? <Skeleton /> : (
          <div className="text-[26px] font-bold leading-none text-purple-custom">
            {((metrics.scansToday || 0) * 3).toLocaleString()}
          </div>
        )}
        <div className="text-[11px] text-muted mt-1.5">Redeemable for GHS</div>
      </div>
      
      {/* CARD 3: IMPACT STATUS */}
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">
          Project Status
        </div>
        {loading ? <Skeleton /> : (
          <div className="text-[26px] font-bold leading-none text-green-custom">ACTIVE</div>
        )}
        <div className="text-[11px] text-muted mt-1.5">Pilot Phase 1</div>
      </div>
      
      {/* CARD 4: RANKING */}
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">
          Field Ranking
        </div>
        {loading ? <Skeleton /> : (
          <div className="text-[26px] font-bold leading-none text-blue-custom">#1</div>
        )}
        <div className="text-[11px] text-muted mt-1.5">Top Contributor</div>
      </div>
    </div>
  );
}
