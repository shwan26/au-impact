// lib/auth.ts (server-only)
import { createServerClientForServerComponents } from '@/lib/supabaseServer'

export type Role = 'sau' | 'auso' | 'user'

export async function getSession() {
  const supabase = createServerClientForServerComponents()
  const { data, error } = await supabase.auth.getUser()
  return { user: data?.user ?? null, error }
}

export async function getSessionRole(): Promise<Role> {
  const { user } = await getSession()
  const role = (user?.app_metadata?.role as string) ?? 'user'
  return (role === 'sau' || role === 'auso') ? role : 'user'
}

export async function isSAU() { return (await getSessionRole()) === 'sau' }
export async function isAUSO() { return (await getSessionRole()) === 'auso' }
