// app/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { events, merches } from '@/lib/mock';
import type { Event, Merch } from '@/types/db';
import PosterCard from '@/components/home/PosterCard';
import MerchCard from '@/components/home/MerchCard';

type EventWithImage = Event & { imageUrl?: string };

export default function HomePage() {
  const evs = events() as EventWithImage[];
  const merch = merches as Merch[];

  // put your real image under /public/images/home/
  const CALENDAR_SRC = '/images/home/june-calendar.jpg';

  return (
    <>
      {/* 🔴 Full-width red headline/nav (matches your screenshot) */}
      <div className="bg-[#b40000] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-2xl font-extrabold tracking-tight">AU Impact</div>
          <nav className="flex flex-wrap items-center gap-8 text-sm">
            <Link href="/public/event" className="hover:underline">Event</Link>
            <Link href="/public/fundraising" className="hover:underline">Fundraising</Link>
            <Link href="/public/merchandise" className="hover:underline">Merchandise</Link>
            <Link href="/public/announcements" className="hover:underline">Announcements</Link>
            <Link
              href="/public/login"
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
            >
              Login
            </Link>
          </nav>
        </div>
      </div>

      {/* Page content */}
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {/* Calendar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold">June Calendar</h2>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <Image
              src={CALENDAR_SRC}
              alt="Monthly calendar"
              fill
              sizes="(max-width: 768px) 100vw, 1000px"
              className="object-cover"
              priority
            />
          </div>
        </section>

        {/* Upcoming events */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold">Upcoming events</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {evs.slice(0, 8).map((e) => (
              <PosterCard
                key={e.id}
                href={`/public/event/${e.id}`}  // singular route to detail
                title={e.title}
                imageUrl={e.imageUrl}
              />
            ))}
          </div>
        </section>

        {/* Popular Merchandise */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold">Popular Merchandise</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {merch.slice(0, 8).map((m) => (
              <MerchCard
                key={m.itemId}
                href="/public/merchandise" // update if you add per-item pages
                title={m.title}
                imageUrl={m.images?.poster?.url}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
