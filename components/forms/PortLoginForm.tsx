'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

export default function PortalLoginForm({
  redirectTo = '/',
  role = 'user', // 'user' means "any role can log in", used on generic /login
}: {
  redirectTo?: string;
  role?: 'auso' | 'sau' | 'user';
}) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const login = async () => {
    setBusy(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    // Check role
    const { data: { session } } = await supabase.auth.getSession();
    const actualRole = (session?.user?.app_metadata as any)?.role ?? 'user';

    if (role === 'sau' && actualRole !== 'sau') {
      setErr('This portal is for SAU accounts only. Please use a SAU account.');
      setBusy(false);
      return;
    }
    if (role === 'auso' && actualRole !== 'auso') {
      setErr('This portal is for AUSO accounts only. Please use an AUSO account.');
      setBusy(false);
      return;
    }

    router.push(redirectTo);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
      <h1 className="mb-3 text-xl font-extrabold">
        {role === 'sau' ? 'SAU Portal Login'
         : role === 'auso' ? 'AUSO Portal Login'
         : 'Login'}
      </h1>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="you@au.edu"
        />
      </label>

      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="••••••••"
        />
      </label>

      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={login}
          disabled={busy}
          className="rounded-lg bg-zinc-200 px-4 py-2 font-semibold text-zinc-800 hover:bg-zinc-300 disabled:opacity-50"
        >
          {busy ? 'Logging in…' : 'Login'}
        </button>

        {/* Public self-signup allowed only for normal users */}
        {role === 'user' && (
          <Link
            href="/public/create-account"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-center font-semibold hover:bg-zinc-50"
          >
            Create Account
          </Link>
        )}
      </div>
    </div>
  );
}
