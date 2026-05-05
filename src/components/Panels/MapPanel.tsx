'use client';
import dynamic from 'next/dynamic';

const ScanMap = dynamic(() => import('./ScanMap'), { 
  ssr: false, 
  loading: () => <div className="h-[450px] w-full bg-surf border border-border rounded-[10px] flex items-center justify-center text-muted">Loading map...</div> 
});

export default function MapPanel() {
  return <ScanMap />;
}
