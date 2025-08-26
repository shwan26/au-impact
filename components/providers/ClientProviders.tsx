// components/providers/ClientProviders.tsx
'use client';
import { AuthProvider } from '@/components/auth/AuthContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
