'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';


export function useAuth() {
  const [user, setUser] = useState<null | { id: string; email?: string; role?: string }>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u ? { id: u.id, email: u.email ?? undefined, role: (u.app_metadata?.role as string) || 'user' } : null);
      setLoading(false);
  });


  const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
    const u = session?.user;
    setUser(u ? { id: u.id, email: u.email ?? undefined, role: (u?.app_metadata?.role as string) || 'user' } : null);
  });


    return () => { sub.subscription?.unsubscribe(); };
  }, []);


  return { user, loading };
}