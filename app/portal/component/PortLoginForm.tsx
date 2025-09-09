'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PortalLoginForm({
  redirectTo = '/',
  role = 'user',
}: {
  redirectTo?: string;        // where to go after login
  role?: 'auso' | 'sau' | 'user'; // sets a cookie for simple route guards
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function go() {
    // 🔐 set a simple cookie so any middleware/guards know we're "logged in"
    try {
      document.cookie = `au_role=${role}; path=/; max-age=86400`; // 1 day
      document.cookie = `au_auth=1; path=/; max-age=86400`;
    } catch {}

    // 🚀 try client-side nav, then hard-nav fallback to guarantee it moves
    try {
      router.push(redirectTo);
    } finally {
      // if something silently prevents client nav, do a full redirect
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== redirectTo) {
          window.location.assign(redirectTo);
        }
      }, 0);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
      <h1 className="mb-3 text-xl font-extrabold">Login</h1>

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

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* IMPORTANT: type=button so form submit never blocks navigation */}
        <button
          type="button"
          onClick={go}
          className="rounded-lg bg-zinc-200 px-4 py-2 font-semibold text-zinc-800 hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          Login
        </button>

        <Link
          href="/register"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-center font-semibold hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        >
          Create Account
        </Link>
      </div>

      {/* Temporary debug links (remove later) */}
      <div className="mt-3 text-xs text-zinc-500">
        Debug: <Link className="underline" href={redirectTo}>{redirectTo}</Link>
      </div>
    </div>
  );
}
