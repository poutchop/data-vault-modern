export default function MetricCards() {
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
        <div className="text-[26px] font-bold leading-none text-green-custom">47</div>
        <div className="text-[11px] text-muted mt-1.5">+12 since 9 am · 3 flagged</div>
      </div>
      
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
          Verification rate
        </div>
        <div className="text-[26px] font-bold leading-none text-blue-custom">94%</div>
        <div className="text-[11px] text-muted mt-1.5">Triple-factor pass rate</div>
      </div>
      
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
          CO₂ avoided (kg)
        </div>
        <div className="text-[26px] font-bold leading-none text-amber-custom">2,841</div>
        <div className="text-[11px] text-muted mt-1.5">18 active participants</div>
      </div>
      
      <div className="bg-surf border border-border rounded-[10px] p-4">
        <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2 flex justify-between items-center">
          Payouts sent
        </div>
        <div className="text-[26px] font-bold leading-none text-purple-custom">GHS 1,240</div>
        <div className="text-[11px] text-muted mt-1.5">MTN & Telecel MoMo</div>
      </div>
    </div>
  );
}
