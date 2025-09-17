import { createServerClientForServerComponents } from '@/lib/supabaseServer';

export async function getSessionRole() {
  const supabase = createServerClientForServerComponents();
  const { data: { user } } = await supabase.auth.getUser();
  return (user?.app_metadata?.role as string) || 'user';
}

export async function isSAU() { return (await getSessionRole()) === 'sau'; }
export async function isAUSO() { return (await getSessionRole()) === 'auso'; }
