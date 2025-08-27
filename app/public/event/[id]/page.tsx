import { use } from 'react';
import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/mock';
import RegisterButtons from '@/components/events/RegisterButtons';
import type { Event as BaseEvent } from '@/types/db';
import Image from 'next/image';

type EventExtras = {
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  priceType?: 'free' | 'paid';
  openStaffSlots?: number;
  openParticipantSlots?: number;
  registeredStaff?: number;
  registeredParticipants?: number;
};
type Event = BaseEvent & EventExtras;

function formatRange(dateISO: string, startISO?: string, endISO?: string) {
  const s = new Date(startISO ?? dateISO);
  const e = new Date(endISO ?? dateISO);
  const same =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return same
    ? s.toLocaleDateString(undefined, opts)
    : `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

export default function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // Next 15: unwrap Promise
  const found = getEventById(id);
  if (!found) return notFound();

  const ev = found as Event;
  const dateText = formatRange(ev.date, ev.startDate, ev.endDate);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top: poster left, info + buttons right */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {ev.imageUrl && (
            
            <Image
              src={ev.imageUrl}
              alt={ev.title}
              className="w-full max-w-xl rounded-xl object-cover"
            />
          )}
        </div>

        <div className="md:col-span-1">
          <h1 className="text-3xl font-extrabold">{ev.title}</h1>
          <p className="mt-1 text-sm text-zinc-600">{dateText}</p>

          <div className="mt-4 text-base font-semibold">
            <div>Registered Staff: {ev.registeredStaff ?? 0}</div>
            <div>Open Staff Slot: {ev.openStaffSlots ?? 0}</div>

            <div className="mt-4">Registered Participant: {ev.registeredParticipants ?? 0}</div>
            <div>Open Participant Slot: {ev.openParticipantSlots ?? 0}</div>
          </div>

          <div className="mt-5">
            <RegisterButtons
              eventId={ev.id}
              openStaff={ev.openStaffSlots ?? 0}
              openParticipants={ev.openParticipantSlots ?? 0}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="whitespace-pre-line text-[15px] leading-7 text-zinc-800">
            {ev.description}
          </div>
        </div>
        <div className="md:col-span-1" />
      </div>
    </div>
  );
}
