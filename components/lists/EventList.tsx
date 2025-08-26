'use client';

import { useMemo, useState } from 'react';
import { events } from '@/lib/mock';
import type { Event as BaseEvent } from '@/types/db';
import EventCard from '@/components/cards/EventCard';

type FilterKey = 'free' | 'paid' | 'participant' | 'staff';

type EventExtras = {
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  priceType?: 'free' | 'paid';
  openParticipantSlots?: number;
  openStaffSlots?: number;
  registeredParticipants?: number;
  registeredStaff?: number;
};
type Event = BaseEvent & EventExtras;

const getStart = (e: Event): Date => new Date(e.startDate ?? e.date);
const getEnd = (e: Event): Date => new Date(e.endDate ?? e.date);
const isPast = (e: Event): boolean => {
  const end = getEnd(e).getTime();
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return end < t.getTime();
};

export default function EventList() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    free: false,
    paid: false,
    participant: false,
    staff: false,
  });

  const all = events() as unknown as Event[];

  const filtered = useMemo(() => {
    let list = all.filter((e) => (tab === 'past' ? isPast(e) : !isPast(e)));

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(needle));
    }

    const priceOn = filters.free || filters.paid;
    if (priceOn) {
      list = list.filter(
        (e) => (filters.free && e.priceType === 'free') || (filters.paid && e.priceType === 'paid'),
      );
    }
    if (filters.participant) list = list.filter((e) => (e.openParticipantSlots ?? 0) > 0);
    if (filters.staff) list = list.filter((e) => (e.openStaffSlots ?? 0) > 0);

    list.sort((a, b) => getStart(a).getTime() - getStart(b).getTime());
    return list;
  }, [all, tab, q, filters]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Bigger tab boxes */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setTab('upcoming')}
          className={`rounded-2xl border px-8 py-4 text-2xl font-extrabold ${
            tab === 'upcoming' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setTab('past')}
          className={`rounded-2xl border px-8 py-4 text-2xl font-extrabold ${
            tab === 'past' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          Past Events
        </button>
      </div>

      {/* Filters + big right-aligned search */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-base">
          {(['free', 'paid', 'participant', 'staff'] as const).map((k) => (
            <label key={k} className="flex items-center gap-3 capitalize">
              <input
                type="checkbox"
                checked={filters[k]}
                onChange={(e) => setFilters((f) => ({ ...f, [k]: e.target.checked }))}
              />
              <span>{k}</span>
            </label>
          ))}
        </div>

        <div className="md:ml-auto flex w-full items-center justify-end gap-3 md:w-auto">
          <input
            className="w-full rounded-2xl border border-zinc-300 px-6 py-3.5 text-lg outline-none focus:ring-2 focus:ring-zinc-200 md:w-[32rem]"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setQ((v) => v)}
          />
          <button
            className="rounded-2xl bg-zinc-200 px-6 py-3.5 text-lg font-semibold hover:bg-zinc-300"
            onClick={() => setQ((v) => v)}
          >
            Search
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((ev) => (
            <EventCard key={ev.id} ev={ev} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <h4 className="text-base font-extrabold">No events found</h4>
          <p className="text-xs text-zinc-600">Try adjusting filters or your search.</p>
        </div>
      )}
    </div>
  );
}
