// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Use NEXT_PUBLIC vars so it works on client + server
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon);

// If you also need a helper for server-only (with service role key):
export function getSupabaseServer() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase env vars');
  }
  return createClient(url, serviceKey);
}
