'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = (usePathname() ?? '').toLowerCase();

  // Hide the public header on admin dashboards & their subpages
  const hide =
    pathname === '/auso' ||
    pathname.startsWith('/auso/') ||
    pathname === '/sau' ||
    pathname.startsWith('/sau/');

  if (hide) return null;

  // Public site header
  return (
    <div className="bg-red-700 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-extrabold">AU Impact</Link>
        <nav className="flex gap-6 text-sm font-semibold">
          <Link href="/public/event">Event</Link>
          <Link href="/public/fundraising">Fundraising</Link>
          <Link href="/public/merchandise">Merchandise</Link>
          <Link href="/public/announcements">Announcements</Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </div>
  );
}
