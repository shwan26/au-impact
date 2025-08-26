// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';

function initials(name?: string, email?: string) {
  const base = name || email || '?';
  return base
    .split(/[ \.@_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
}

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-red-700 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="text-lg font-extrabold">AU Impact - SAU Portal</div>

        {/* Right side */}
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/public/event" className="hover:underline hidden sm:inline">
            Event
          </Link>
          <Link href="/public/fundraising" className="hover:underline hidden sm:inline">
            Fundraising
          </Link>
          <Link href="/public/announcements" className="hover:underline hidden sm:inline">
            Announcements
          </Link>

          {!user ? (
            <Link
              href="/login"
              className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/20"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {/* tiny circular profile */}
              <Link
                href="/profile"
                title={user.name || user.email}
                className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white text-red-700"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-extrabold">{initials(user.name, user.email)}</span>
                )}
              </Link>

              <button
                onClick={logout}
                className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
