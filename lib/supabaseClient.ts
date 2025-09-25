'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail fast if envs are missing (prevents silent “No API key found”)
  if (!url || !key) {
    // Surface a clear message in the browser (useful during dev)
    // You can swap this to console.error + throw if you prefer.
    throw new Error(
      'Supabase env not set. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (and restart dev server).'
    );
  }

  browserClient = createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Ensure storage is defined only in the browser
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    // Optional: tag requests so you can spot them in logs
    global: {
      headers: { 'x-client-info': 'portal-web' },
    },
  });

  return browserClient;
}
