'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Scan {
  id: string;
  participant_name: string;
  board_id: string;
  action_type: string;
  status: 'hardened' | 'flagged' | 'rejected';
  site: string;
  gps_lat: number;
  gps_lng: number;
  created_at: string;
}

export interface VaultMetrics {
  scansToday: number;
  verificationRate: number;
  co2Avoided: number;
  payoutsSent: number;
  activeParticipants: number;
}

export interface LeaderboardEntry {
  name: string;
  site: string;
  pts: number;
  pay: number;
  rank: number;
}

export interface SiteSummary {
  site: string;
  participants: number;
  scans: number;
  co2: number;
  payoutStatus: string;
}

export interface NutritionLog {
  id: string;
  participant_name: string;
  site: string;
  meal: string;
  protein_g: number;
  kcal: number;
  score: number;
  verified: boolean;
  log_date: string;
}

export function useVaultData() {
  const [metrics, setMetrics] = useState<VaultMetrics>({
    scansToday: 0,
    verificationRate: 0,
    co2Avoided: 0,
    payoutsSent: 0,
    activeParticipants: 0,
  });
  const [feed, setFeed] = useState<Scan[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [siteSummaries, setSiteSummaries] = useState<SiteSummary[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const { count: scansCount } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true });

      const { count: participantCount } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true });

      const { data: participantsData } = await supabase
        .from('participants')
        .select('total_payout, total_points, name, site')
        .order('total_points', { ascending: false });

      const { data: allScans } = await supabase
        .from('scans')
        .select('participant_id, participants(site)');

      const { data: nutritionData } = await supabase
        .from('nutrition_logs')
        .select(`
          id,
          meal,
          protein_g,
          kcal,
          score,
          verified,
          log_date,
          participants (name, site)
        `)
        .order('log_date', { ascending: false })
        .limit(20);

      const totalPayout = participantsData?.reduce((acc, p) => acc + (Number(p.total_payout) || 0), 0) || 0;
      const totalCO2 = (scansCount || 0) * 60.5;

      setMetrics({
        scansToday: scansCount || 0,
        verificationRate: 94,
        co2Avoided: Math.round(totalCO2),
        payoutsSent: totalPayout,
        activeParticipants: participantCount || 0,
      });

      if (participantsData) {
        const formattedLeaderboard: LeaderboardEntry[] = participantsData.slice(0, 10).map((p, index) => ({
          name: p.name,
          site: p.site,
          pts: p.total_points,
          pay: p.total_payout,
          rank: index + 1
        }));
        setLeaderboard(formattedLeaderboard);

        // Group by site
        const sites = [...new Set(participantsData.map(p => p.site))];
        const summaries: SiteSummary[] = sites.map(site => {
          const siteParticipants = participantsData.filter(p => p.site === site);
          const siteScansCount = allScans?.filter((s: any) => s.participants?.site === site).length || 0;
          return {
            site,
            participants: siteParticipants.length,
            scans: siteScansCount,
            co2: Math.round(siteScansCount * 60.5),
            payoutStatus: siteParticipants.every(p => Number(p.total_payout) > 0) ? 'Paid' : 'Pending'
          };
        });
        setSiteSummaries(summaries);
      }

      if (nutritionData) {
        const formattedNutrition: NutritionLog[] = nutritionData.map((n: any) => ({
          id: n.id,
          participant_name: n.participants?.name || 'Anonymous',
          site: n.participants?.site || 'Remote',
          meal: n.meal,
          protein_g: n.protein_g,
          kcal: n.kcal,
          score: n.score,
          verified: n.verified,
          log_date: n.log_date
        }));
        setNutritionLogs(formattedNutrition);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };



  const fetchFeed = async () => {

    const { data, error } = await supabase
      .from('scans')
      .select(`
        id,
        board_id,
        action_type,
        status,
        gps_lat,
        gps_lng,
        created_at,
        participants (name, site)
      `)
      .order('created_at', { ascending: false })
      .limit(40);

    if (!error && data) {
      const formattedFeed: Scan[] = data.map((item: any) => ({
        id: item.id,
        participant_name: item.participants?.name || 'Anonymous',
        board_id: item.board_id,
        action_type: item.action_type,
        status: item.status,
        site: item.participants?.site || 'Remote',
        gps_lat: item.gps_lat,
        gps_lng: item.gps_lng,
        created_at: item.created_at,
      }));
      setFeed(formattedFeed);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
    fetchFeed();

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scans' },
        (payload) => {
          console.log('New scan received!', payload);
          fetchMetrics();
          fetchFeed();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { metrics, feed, leaderboard, siteSummaries, nutritionLogs, loading, refresh: () => { fetchMetrics(); fetchFeed(); } };
}
