// lib/supabaseClient.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      'Supabase env not set. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (and restart dev server).'
    );
  }

  browserClient = createBrowserClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    // ✅ DO NOT set Authorization manually — the SDK attaches the user's access token.
    // apikey is automatically sent by the SDK; you can omit it.
    global: {
      headers: {
        'x-client-info': 'portal-web',
        // apikey: anon, // optional; commented because the SDK already sets it
      },
      // If you add a custom fetch later, **do not** overwrite Authorization.
      // fetch: async (input, init = {}) => fetch(input, { ...init, headers: { ...(init.headers || {}) } }),
    },
  });

  return browserClient;
}
