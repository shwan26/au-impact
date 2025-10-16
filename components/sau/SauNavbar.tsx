'use client';

import Link from 'next/link';
import { usePendingCounts } from '@/hooks/usePendingCounts';

function CountPill({ n }: { n: number }) {
  const isZero = Number(n) === 0;
  return (
    <span
      className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold
        ${isZero ? 'bg-white/20 text-white/80' : 'bg-white text-[#a62419]'}`
      }
      style={{ minWidth: 22, height: 18 }}
    >
      {n}
    </span>
  );
}

function NavItem({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <Link href={href} className="relative flex items-center px-4 py-2 text-white hover:text-white">
      <span className="text-lg font-semibold">{label}</span>
      <CountPill n={Number(count ?? 0)} />
    </Link>
  );
}

export default function SauNavbar() {
  // if your hook already returns these, great; otherwise you can pass 0s
  const { announcements, events, fundraising } = usePendingCounts();

  return (
    <header className="w-full bg-[#a62419]">
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-white">
        <Link href="/sau" className="mr-2 px-2 py-2 text-2xl font-extrabold">SAU</Link>

        <NavItem href="/sau/events"        label="Events"        count={events} />
        <NavItem href="/sau/fundraising"   label="Fundraising"   count={fundraising} />
        <NavItem href="/sau/merch"         label="Merch"         count={0} />
        <NavItem href="/sau/announcements" label="Announcements" count={announcements} />

        <div className="ml-auto">
          <Link
            href="/login"
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
