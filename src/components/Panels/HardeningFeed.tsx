import { Scan } from '@/hooks/useVaultData';
import { Trash2 } from 'lucide-react';

interface HardeningFeedProps {
  feed: Scan[];
  loading: boolean;
  onDelete?: (id: string) => void;
}

export default function HardeningFeed({ feed, loading, onDelete }: HardeningFeedProps) {
  const Skeleton = () => (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-[rgba(255,255,255,0.04)]">
      <div className="w-[7px] h-[7px] rounded-full mt-1 shrink-0 bg-surf2 animate-pulse"></div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3 w-1/3 bg-surf2 rounded animate-pulse"></div>
        <div className="h-2 w-1/2 bg-surf2 rounded animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-surf border border-border rounded-[10px] overflow-hidden h-full flex flex-col">
      <div className="p-3 px-4 border-b border-border flex items-center gap-2 text-[12px] font-medium shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-green-custom animate-pulse"></div>
        Real-time hardening feed
        <span className="text-muted text-[10px] ml-auto">Live updates · QR · GPS · Time</span>
      </div>
      <div className="px-4 overflow-y-auto flex-1 max-h-[420px]">
        {loading ? (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        ) : feed.length === 0 ? (
          <div className="py-10 text-center text-muted text-xs">No scans recorded today.</div>
        ) : (
          feed.map((f, i) => {
            const dotCls = f.status === 'hardened' ? 'bg-green-custom' : f.status === 'flagged' ? 'bg-amber-custom' : 'bg-red-custom';
            const badgeCls = f.status === 'hardened' ? 'bg-gdim text-green-custom' : f.status === 'flagged' ? 'bg-adim text-amber-custom' : 'bg-[rgba(255,90,90,0.12)] text-red-custom';
            const action = f.action_type.replace(/_/g, ' ');
            
            const timeStr = new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={f.id || i} className="flex items-start gap-2.5 py-2.5 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
                <div className={`w-[7px] h-[7px] rounded-full mt-1 shrink-0 ${dotCls}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium">
                    {f.participant_name} <span className="text-muted font-normal text-[11px]">#{f.board_id}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded ml-1 text-[10px] font-bold tracking-[0.3px] ${badgeCls}`}>{f.status}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded ml-1 text-[10px] font-bold tracking-[0.3px] bg-bdim text-blue-custom capitalize">{action}</span>
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">{f.site} · GPS: {f.gps_lat.toFixed(4)}°N {f.gps_lng.toFixed(4)}°W · Δt 4s</div>
                  <div className="flex gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-custom" title="QR"></div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{background: f.status === 'hardened' ? 'var(--color-green-custom)' : f.status === 'flagged' ? 'var(--color-amber-custom)' : 'var(--color-red-custom)'}} title="GPS"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-custom" title="Time"></div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-auto shrink-0">
                  <div className="text-[10px] text-muted whitespace-nowrap">{timeStr}</div>
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(f.id)}
                      className="text-red-custom/40 hover:text-red-custom transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="py-2 px-4 border-t border-border text-[10px] text-muted shrink-0">
        Showing latest {feed.length} scans · updates appear instantly via Supabase
      </div>
    </div>
  );
}

