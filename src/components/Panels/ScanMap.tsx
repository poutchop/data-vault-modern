'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet with webpack/vite/next
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

import { Scan, SiteSummary } from '@/hooks/useVaultData';

interface ScanMapProps {
  scans: Scan[];
  sites: SiteSummary[];
}

export default function ScanMap({ scans, sites }: ScanMapProps) {
  const farmACount = sites.find(s => s.site.includes('Farm A'))?.scans || 0;
  const farmBCount = sites.find(s => s.site.includes('Farm B'))?.scans || 0;
  const coopCount = sites.find(s => s.site.includes('Co-op'))?.scans || 0;

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
        <div className="p-3 px-4 border-b border-border text-[12px] font-medium flex items-center gap-2">
          <span className="text-[16px]">🗺️</span>
          Berekuso Scan Map — GPS Geofence View
          <span className="text-muted text-[10px] ml-auto font-normal">Live scan locations from Supabase</span>
        </div>
        <div className="h-[450px] w-full z-[1] relative">
          <MapContainer center={[5.7456, -0.3214]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Geofence Circles */}
            <Circle center={[5.7456, -0.3214]} pathOptions={{ color: '#10d97e', fillColor: '#10d97e', fillOpacity: 0.05 }} radius={200} />
            <Circle center={[5.7448, -0.3221]} pathOptions={{ color: '#4d9fff', fillColor: '#4d9fff', fillOpacity: 0.05 }} radius={200} />
            <Circle center={[5.7444, -0.3228]} pathOptions={{ color: '#f4a134', fillColor: '#f4a134', fillOpacity: 0.05 }} radius={200} />

            {/* Scan Markers */}
            {scans.map((s) => (
              <Marker key={s.id} position={[s.gps_lat, s.gps_lng]} icon={icon}>
                <Popup>
                  <div className="text-[11px]">
                    <div className="font-bold">{s.participant_name}</div>
                    <div className="text-muted">{s.action_type}</div>
                    <div className="mt-1 text-[10px]">{new Date(s.scan_time_device).toLocaleString()}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        <div className="bg-surf border border-border rounded-[10px] p-4 text-center">
          <div className="text-[10px] uppercase text-muted tracking-[1px] mb-1">Farm A Scans</div>
          <div className="text-[28px] font-bold text-green-custom">{farmACount}</div>
          <div className="text-[10px] text-muted mt-1">Total database records</div>
        </div>
        <div className="bg-surf border border-border rounded-[10px] p-4 text-center">
          <div className="text-[10px] uppercase text-muted tracking-[1px] mb-1">Farm B Scans</div>
          <div className="text-[28px] font-bold text-blue-custom">{farmBCount}</div>
          <div className="text-[10px] text-muted mt-1">Total database records</div>
        </div>
        <div className="bg-surf border border-border rounded-[10px] p-4 text-center">
          <div className="text-[10px] uppercase text-muted tracking-[1px] mb-1">Co-op W Scans</div>
          <div className="text-[28px] font-bold text-amber-custom">{coopCount}</div>
          <div className="text-[10px] text-muted mt-1">Total database records</div>
        </div>
      </div>
    </div>
  );
}

