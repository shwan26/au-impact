// app/sau/event/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Ev = {
  EventID: string | number | null;
  Title: string | null;
  PosterURL?: string | null;
  StartDateTime?: string | null;
  EndDateTime?: string | null;
  Venue?: string | null;
  Status: string;
};

const TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'LIVE', label: 'Live / Approved' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'COMPLETE', label: 'Complete' },
] as const;

export default function SAUEventList() {
  const [items, setItems] = useState<Ev[]>([]);
  const [active, setActive] = useState<(typeof TABS)[number]['key']>('PENDING');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const r = await fetch('/api/events', { cache: 'no-store' });
      const t = await r.text();
      const j = t ? JSON.parse(t) : {};
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const { key } of TABS) c[key] = 0;
    for (const it of items) {
      const st = (it.Status || 'PENDING').toUpperCase();
      if (c[st] != null) c[st] += 1;
    }
    return c;
  }, [items]);

  const visible = useMemo(() => {
    return items.filter((it) => (it.Status || 'PENDING').toUpperCase() === active);
  }, [items, active]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">SAU — Events</h1>
        <Link
          href="/sau/event/create"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Create Event
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={[
                'rounded-full px-3 py-1.5 text-sm border',
                isActive ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-800 hover:bg-zinc-50 border-zinc-300',
              ].join(' ')}
            >
              {t.label}
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700">
                {counts[t.key] ?? 0}
              </span>
            </button>
          );
        })}
        <button
          onClick={load}
          className="ml-auto rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Refresh
        </button>
      </div>

      {err && <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {loading && <div className="mt-4 text-sm">Loading…</div>}

      {/* Visible list (only the active status) */}
      <div className="mt-4">
        {visible.length === 0 ? (
          <div className="rounded-md border border-zinc-200 p-4 text-sm text-zinc-600">No events.</div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((e) => (
              <li key={String(e.EventID)} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                {e.PosterURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.PosterURL} alt={e.Title ?? ''} className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="aspect-[16/9] w-full bg-zinc-100" />
                )}
                <div className="p-3">
                  <div className="truncate text-sm font-semibold">{e.Title ?? 'Untitled Event'}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Link
                      href={`/public/event/${e.EventID}`}
                      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs hover:bg-zinc-50"
                    >
                      Public
                    </Link>
                    <Link
                      href={`/sau/event/${e.EventID}`}
                      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs hover:bg-zinc-50"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/sau/event/${e.EventID}/participants`}
                      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs hover:bg-zinc-50"
                    >
                      Check Regs
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
