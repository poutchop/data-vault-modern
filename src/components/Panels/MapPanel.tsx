'use client';
import dynamic from 'next/dynamic';
import { Scan, SiteSummary } from '@/hooks/useVaultData';

const ScanMap = dynamic(() => import('./ScanMap'), { 
  ssr: false, 
  loading: () => <div className="h-[450px] w-full bg-surf border border-border rounded-[10px] flex items-center justify-center text-muted">Loading map...</div> 
});

interface MapPanelProps {
  scans: Scan[];
  sites: SiteSummary[];
}

export default function MapPanel({ scans, sites }: MapPanelProps) {
  return <ScanMap scans={scans} sites={sites} />;
}
