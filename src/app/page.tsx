'use client';

import { useState } from 'react';
import Topbar from '@/components/Layout/Topbar';
import Tabs from '@/components/Layout/Tabs';
import MetricCards from '@/components/Dashboard/MetricCards';
import HardeningFeed from '@/components/Panels/HardeningFeed';
import VerifierPanel from '@/components/Panels/VerifierPanel';
import ClimateAnalytics from '@/components/Panels/ClimateAnalytics';
import Leaderboard from '@/components/Panels/Leaderboard';
import ProvostPortal from '@/components/Panels/ProvostPortal';
import MapPanel from '@/components/Panels/MapPanel';

export default function Home() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <>
      <Topbar />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="p-5 px-6 flex flex-col gap-4 max-w-[1600px] mx-auto w-full">
        {/* Metric cards are always visible */}
        <MetricCards />

        {/* Panel: Hardening Feed */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_380px] gap-[14px]">
            <HardeningFeed />
            <VerifierPanel />
          </div>
        )}

        {/* Panel: Analytics */}
        {activeTab === 'analytics' && (
          <ClimateAnalytics />
        )}

        {/* Leaderboard Panel */}
        {activeTab === 'leaderboard' && <Leaderboard />}

        {/* Map Panel */}
        {activeTab === 'map' && <MapPanel />}

        {/* Provost Portal Panel */}
        {activeTab === 'provost' && <ProvostPortal />}
      </main>

      <footer className="p-5 px-6 text-center text-[11px] text-muted border-t border-border mt-auto">
        Carbon Clarity Data Vault · dMRV Platform · Ashesi University Pilot · v1.0.0-mvp<br/>
        <span className="text-[rgba(255,255,255,0.25)] dark:text-[rgba(255,255,255,0.25)] text-[rgba(0,0,0,0.25)]">
          Built by Pout Chop Jal Madeng · Mastercard Foundation Scholar
        </span>
      </footer>
    </>
  );
}
