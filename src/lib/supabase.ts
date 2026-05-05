import { createClient } from '@supabase/supabase-js';

// These should be set in .env.local
// NEXT_PUBLIC_SUPABASE_URL=your-project-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

/**
 * Robust storage utility for Carbon Clarity Data Vault.
 * Handles localStorage with an in-memory fallback for browsers 
 * with strict tracking prevention (e.g., MS Edge).
 */
class MemoryStorage {
  private data: Record<string, string> = {};
  setItem(key: string, value: string) { this.data[key] = String(value); }
  getItem(key: string) { return this.data[key] || null; }
  removeItem(key: string) { delete this.data[key]; }
  clear() { this.data = {}; }
  get length() { return Object.keys(this.data).length; }
  key(index: number) { return Object.keys(this.data)[index] || null; }
}

const getSafeStorage = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    console.warn('[Vault] LocalStorage is blocked. Falling back to in-memory storage.');
    return new MemoryStorage();
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getSafeStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  realtime: { params: { eventsPerSecond: 10 } },
});


/**
 * Example schema design for Data Vault MVP:
 * 
 * -- Table: participants
 * CREATE TABLE participants (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   site TEXT NOT NULL,
 *   total_points INT DEFAULT 0,
 *   total_payout DECIMAL(10, 2) DEFAULT 0.00
 * );
 * 
 * -- Table: scans
 * CREATE TABLE scans (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   participant_id UUID REFERENCES participants(id),
 *   board_id TEXT NOT NULL,
 *   action_type TEXT NOT NULL,
 *   status TEXT CHECK (status IN ('hardened', 'flagged', 'rejected')),
 *   gps_lat DECIMAL(9, 6),
 *   gps_lng DECIMAL(9, 6),
 *   scan_time_device TIMESTAMP WITH TIME ZONE,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Table: nutrition_logs
 * CREATE TABLE nutrition_logs (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   participant_id UUID REFERENCES participants(id),
 *   meal TEXT NOT NULL,
 *   protein_g INT NOT NULL,
 *   kcal INT NOT NULL,
 *   score INT NOT NULL,
 *   verified BOOLEAN DEFAULT false,
 *   log_date DATE NOT NULL
 * );
 */
