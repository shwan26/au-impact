'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !key) {
    throw new Error(
      'Supabase env not set. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (and restart dev server).'
    );
  }

  browserClient = createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      // ✅ explicitly include the required headers
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'x-client-info': 'portal-web',
      },
      // (Optional) If you ever add a custom fetch, make sure you KEEP headers:
      // fetch: async (u, opts = {}) =>
      //   fetch(u, { ...opts, headers: { ...(opts.headers || {}) } }),
    },
  });

  return browserClient;
}
