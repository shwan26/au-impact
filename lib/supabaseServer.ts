// lib/supabaseServer.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Use this in Server Components. It must NOT try to write cookies
 * (Next will throw). Let middleware or route actions do refresh writes.
 */
export function createServerClientForServerComponents() {
  const store = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value
        },
        // No-ops to avoid "Cookies can only be modified..." in RSC
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  )
}

/**
 * Use this ONLY in Route Handlers / Server Actions (can write cookies).
 */
export async function createServerClientForRoute() {
  const store = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          store.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          store.set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    }
  )
}
