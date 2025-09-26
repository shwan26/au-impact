// lib/supabaseServer.ts
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/** Route Handlers & Server Actions (can write cookies). */
export async function getSupabaseServer() {
  const store = await cookies(); // ✅ await to satisfy Next 15 dynamic API

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          store.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          store.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}

/** Server Components (RSC) — do NOT write cookies here. */
export function getSupabaseRSC() {
  const store = cookies(); // ✅ sync in RSC

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        // no-ops in RSC
        set(_n: string, _v: string, _o: CookieOptions) {},
        remove(_n: string, _o: CookieOptions) {},
      },
    }
  );
}

/* ---------- Backward-compat aliases (so existing imports keep working) ---------- */
export const createServerClientForRoute = getSupabaseServer;
export const createServerClientForServerComponents = getSupabaseRSC;
