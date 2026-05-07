'use client';

import { useState } from 'react';
import Topbar from '@/components/Layout/Topbar';
import Tabs from '@/components/Layout/Tabs';
import MetricCards from '@/components/Dashboard/MetricCards';
import HardeningFeed from '@/components/Panels/HardeningFeed';
import VerifierPanel from '@/components/Panels/VerifierPanel';
import ClimateAnalytics from '@/components/Panels/ClimateAnalytics';
import Leaderboard from '@/components/Panels/Leaderboard';
import MainPortal from '@/components/Panels/MainPortal';
import MapPanel from '@/components/Panels/MapPanel';
import Scanner from '@/components/Panels/Scanner';
import FloatingAI from '@/components/FloatingAI';
import Gatekeeper from '@/components/Auth/Gatekeeper';
import { useVaultData } from '@/hooks/useVaultData';
import { useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('scanner'); // Default to scanner for better field UX
  const [gatekeeperKey, setGatekeeperKey] = useState(0);
  const [localScans, setLocalScans] = useState<any[]>([]);
  const { metrics, feed, leaderboard, siteSummaries, nutritionLogs, loading } = useVaultData();

  // Load saved scans on mount to ensure they NEVER vanish
  useEffect(() => {
    const saved = localStorage.getItem('vault_field_scans');
    if (saved) setLocalScans(JSON.parse(saved));
  }, []);

  // Sync to localStorage whenever scans change
  useEffect(() => {
    if (localScans.length > 0) {
      localStorage.setItem('vault_field_scans', JSON.stringify(localScans));
    }
  }, [localScans]);

  const mode = typeof window !== 'undefined' ? sessionStorage.getItem('vault_unlocked') : null;
  const agentName = typeof window !== 'undefined' ? sessionStorage.getItem('vault_agent_name') : 'Agent';

  // DYNAMIC DATA MERGING: Combine DB with local actions
  const combinedFeed = [...localScans, ...feed];

  // Recalculate metrics based on local additions and identity
  const dynamicMetrics = {
    ...metrics,
    scansToday: localScans.filter(s => s.participant_name === agentName).length,
    totalPoints: localScans.filter(s => s.participant_name === agentName).length * 3,
    totalCO2_kg: Math.round(metrics.totalCO2_kg + (localScans.length * 60.5)),
    certifiedCredits_t: Number((metrics.certifiedCredits_t + (localScans.length * 0.0605)).toFixed(3)),
    accruedMarketValue_usd: Number((metrics.accruedMarketValue_usd + (localScans.length * 0.0605 * 15)).toFixed(2))
  };

  // Recalculate leaderboard
  const dynamicLeaderboard = [...leaderboard];
  localScans.forEach(scan => {
    const entry = dynamicLeaderboard.find(e => e.name === scan.participant_name);
    if (entry) {
      entry.pts += 3; // +3 pts per scan
    } else {
      dynamicLeaderboard.push({
        name: scan.participant_name,
        site: scan.site,
        pts: 3,
        pay: 0,
        rank: dynamicLeaderboard.length + 1
      });
    }
  });

  // Re-sort leaderboard by points
  dynamicLeaderboard.sort((a, b) => b.pts - a.pts).forEach((e, i) => e.rank = i + 1);
  
  const handleNewScan = (newScan: any) => {
    const scanWithIdentity = {
      ...newScan,
      participant_name: agentName,
      site: 'Berekuso'
    };
    setLocalScans(prev => [scanWithIdentity, ...prev]);
  };

  const handleDelete = (id: string) => {
    setLocalScans(prev => prev.filter(s => s.id !== id));
  };

  const handleRelock = () => {
    sessionStorage.removeItem('vault_unlocked');
    setGatekeeperKey(prev => prev + 1);
  };

  return (
    <Gatekeeper key={gatekeeperKey}>
      <Topbar onRelock={handleRelock} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={mode === 'admin'} />
      
      <main className="p-5 px-6 flex flex-col gap-4 max-w-[1600px] mx-auto w-full min-h-[calc(100vh-200px)]">
        <MetricCards metrics={dynamicMetrics} loading={loading} isAdmin={mode === 'admin'} />

        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_380px] gap-[14px]">
            <HardeningFeed feed={combinedFeed} loading={loading} onDelete={handleDelete} />
            <VerifierPanel />
          </div>
        )}

        {activeTab === 'analytics' && (
          <ClimateAnalytics siteSummaries={siteSummaries} />
        )}

        {activeTab === 'leaderboard' && <Leaderboard entries={dynamicLeaderboard} loading={loading} isAdmin={mode === 'admin'} />}
        {activeTab === 'map' && <MapPanel scans={feed} sites={siteSummaries} />}
        {activeTab === 'main' && <MainPortal scans={combinedFeed} metrics={dynamicMetrics} loading={loading} />}
        {activeTab === 'scanner' && <Scanner onScanComplete={handleNewScan} isAdmin={mode === 'admin'} />}
      </main>

      <FloatingAI />

      <footer className="p-5 px-6 text-center text-[11px] text-muted border-t border-border mt-auto">
        Carbon Clarity Data Vault · dMRV Platform · Ashesi University Pilot · v1.0.0-mvp<br/>
        <span className="text-[rgba(255,255,255,0.25)] dark:text-[rgba(255,255,255,0.25)] text-[rgba(0,0,0,0.25)]">
          Built by Pout Chop Jal Madeng · Mastercard Foundation Scholar
        </span>
      </footer>
    </Gatekeeper>
  );
}
