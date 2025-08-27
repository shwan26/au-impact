'use client';

import Link from 'next/link';
import type { Event } from '@/types/db';
import Image from 'next/image';

const dateText = (ev: Event) => {
  const s = new Date(ev.startDate ?? ev.date);
  const e = new Date(ev.endDate ?? ev.date);
  const same =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();
  const fmt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return same
    ? s.toLocaleDateString(undefined, fmt)
    : `${s.toLocaleDateString(undefined, fmt)} – ${e.toLocaleDateString(undefined, fmt)}`;
};

export default function EventCard({ ev }: { ev: Event }) {
  return (
    <Link href={`/public/event/${ev.id}`} className="block group" prefetch={false}>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-md">
        {/* Consistent, normal-sized thumbnail */}
        {ev.imageUrl && (
          <div className="relative h-40 w-full overflow-hidden rounded-lg">
            <Image
              src={ev.imageUrl}
              alt={ev.title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-4">
          <h3 className="text-2xl font-extrabold leading-tight">{ev.title}</h3>
          <p className="mt-1 text-sm text-zinc-600">{dateText(ev)}</p>

          <div className="mt-2 grid grid-cols-1 gap-0.5 text-base font-semibold">
            <span>Open Staff Slot: {ev.openStaffSlots ?? 0}</span>
            <span>Open Participant Slot: {ev.openParticipantSlots ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
