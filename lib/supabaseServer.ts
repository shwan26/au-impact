// lib/supabaseServer.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/** Use this in Server Components (read-only cookies). */
export function createServerClientForServerComponents() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) { return (await cookies()).get(name)?.value },
        async set() {}, // no-ops in RSC
        async remove() {},
      },
    }
  )
}

/** Use this ONLY in Route Handlers or Server Actions (mutable cookies). */
export function createServerClientForRoute() {
  const store = cookies() // mutable here
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return store.get(name)?.value },
        set(name: string, value: string, options: any) { store.set({ name, value, ...options }) },
        remove(name: string, options: any) { store.set({ name, value: '', ...options, maxAge: 0 }) },
      },
    }
  )
}
