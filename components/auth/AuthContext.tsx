// components/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = { name: string; email: string; avatarUrl?: string } | null;

type AuthCtx = {
  user: AuthUser;
  login: (user: NonNullable<AuthUser>) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth:user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      if (user) localStorage.setItem('auth:user', JSON.stringify(user));
      else localStorage.removeItem('auth:user');
    } catch {}
  }, [user]);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      login: (u) => setUser(u),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within <AuthProvider>');
  return v;
}
