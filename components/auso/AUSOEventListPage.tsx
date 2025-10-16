'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type ApiEvent = {
  EventID?: string | number | null;
  eventid?: string | number | null;
  Title?: string | null;
  title?: string | null;
  Description?: string | null;
  Status?: string | null;
  status?: string | null;
  StartDateTime?: string | null;
  startdatetime?: string | null;
  EndDateTime?: string | null;
  enddatetime?: string | null;
  Venue?: string | null;
  venue?: string | null;
  PhotoURL?: string | null;
  PosterURL?: string | null;
  photourl?: string | null;
  posterurl?: string | null;
  photo_url?: string | null;
  imageUrl?: string | null;
  id?: string | number | null;
};

type UIEvent = {
  id: string;
  title: string;
  status: string;
  start?: string | null;
  end?: string | null;
  venue?: string | null;
  image?: string | null;
  desc?: string | null;
};

// ✅ Only these four tabs
const STATUS_TABS = ['PENDING','LIVE','COMPLETE','REJECTED'] as const;
type StatusKey = typeof STATUS_TABS[number];

function normalize(ev: ApiEvent): UIEvent | null {
  const id = String(ev.EventID ?? ev.eventid ?? ev.id ?? '').trim();
  if (!id) return null;
  const title = (ev.Title ?? ev.title ?? 'Untitled Event') || 'Untitled Event';
  const status = String(ev.Status ?? ev.status ?? 'PENDING').toUpperCase();
  const image =
    ev.PhotoURL ?? ev.PosterURL ?? ev.imageUrl ?? ev.photourl ?? ev.posterurl ?? ev.photo_url ?? null;
  return {
    id,
    title,
    status,
    start: ev.StartDateTime ?? ev.startdatetime ?? null,
    end: ev.EndDateTime ?? ev.enddatetime ?? null,
    venue: ev.Venue ?? ev.venue ?? null,
    image,
    desc: ev.Description ?? null,
  };
}

function fmtDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

export default function AUSOEventListPage() {
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // default to PENDING (or change to 'LIVE' if you prefer)
  const [activeTab, setActiveTab] = useState<StatusKey>('PENDING');
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch('/api/events', { cache: 'no-store' });
        const t = await r.text();
        if (!r.ok) throw new Error(t || 'Failed to fetch');
        const json = t ? JSON.parse(t) : null;
        const list: ApiEvent[] =
          Array.isArray(json?.items) ? json.items :
          Array.isArray(json?.rows) ? json.rows :
          Array.isArray(json) ? json : [];
        const norm = list.map(normalize).filter(Boolean) as UIEvent[];
        if (!cancelled) setEvents(norm);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // badge counts (only our four)
  const counts = useMemo(() => {
    const base: Record<StatusKey, number> = { PENDING: 0, LIVE: 0, COMPLETE: 0, REJECTED: 0 };
    for (const e of events) {
      const s = (e.status || '').toUpperCase();
      if (s in base) (base as any)[s] += 1;
    }
    return base;
  }, [events]);

  // filter by active tab
  const tabbed = useMemo(
    () => events.filter(e => (e.status || '').toUpperCase() === activeTab),
    [events, activeTab]
  );

  // search within the selected tab
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return tabbed;
    return tabbed.filter(e =>
      e.title.toLowerCase().includes(qq) ||
      (e.venue ?? '').toLowerCase().includes(qq) ||
      (e.desc ?? '').toLowerCase().includes(qq)
    );
  }, [tabbed, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">AUSO — Events</h1>
        <Link
          href="/auso/event/create"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Create Event
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`rounded-full border px-3 py-1 text-sm ${
              activeTab === s
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
            }`}
          >
            {s}
            <span className="ml-1 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-zinc-100 px-1 text-[11px] font-semibold text-zinc-700">
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, venue, description…"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
        />
      </div>

      {/* Content */}
      {loading && <div className="py-8">Loading…</div>}
      {err && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {!loading && !err && filtered.length === 0 && (
        <div className="py-8 text-sm text-zinc-600">No events found.</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((e) => (
          <Link
            key={e.id}
            href={`/auso/event/${e.id}`}
            className="group overflow-hidden rounded-xl border border-zinc-200 bg-white hover:shadow"
          >
            {e.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={e.image}
                alt={e.title}
                className="aspect-[16/9] w-full object-cover"
                loading="lazy"
              />
            ) : null}
            <div className="p-4">
              <div className="text-xs font-semibold tracking-wide text-zinc-500">{e.status}</div>
              <div className="mt-1 line-clamp-2 text-lg font-bold text-zinc-900">{e.title}</div>
              {e.venue && <div className="mt-1 text-sm text-zinc-600">Venue: {e.venue}</div>}
              <div className="mt-1 text-xs text-zinc-500">
                {fmtDate(e.start)} {e.end ? `– ${fmtDate(e.end)}` : ''}
              </div>
              {e.desc && <div className="mt-2 line-clamp-2 text-sm text-zinc-700">{e.desc}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
