// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push('/public/event');
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5"
    >
      <h1 className="mb-3 text-xl font-extrabold">Login</h1>

      {/* Email */}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="you@au.edu"
        />
      </label>

      {/* Password */}
      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="••••••••"
        />
      </label>

      {/* Buttons side-by-side (stack on very small screens) */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="submit"
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
    </form>
  );
}
