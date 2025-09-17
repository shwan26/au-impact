// lib/supabaseServer.ts
// server-only file; no "use client"
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Use this in Server Components/Layouts/Pages.
 * Next 15 forbids mutating cookies here, so set/remove are no-ops.
 */
export function createServerClientForServerComponents() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value
        },
        // IMPORTANT: no-ops in RSC to avoid Next 15 error
        async set() {},
        async remove() {},
      },
    }
  )
}

/**
 * Use this ONLY in Route Handlers (/app/api/*) or Server Actions.
 * Here cookies() is mutable, so we allow set/remove.
 */
export function createServerClientForRoute() {
  const cookieStore = cookies() // mutable in routes/actions
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    }
  )
}
