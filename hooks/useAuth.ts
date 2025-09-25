// hooks/useAuth.ts
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; // ✅ change this

type Role = 'user' | 'sau' | 'auso';

interface AuthUser {
  id: string;
  email?: string;
  role: Role;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(); // ✅ use createClient()

    // Initial load
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        const role = (u.app_metadata?.role as Role) || 'user';
        setUser({ id: u.id, email: u.email ?? undefined, role });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user;
      if (u) {
        const role = (u.app_metadata?.role as Role) || 'user';
        setUser({ id: u.id, email: u.email ?? undefined, role });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
