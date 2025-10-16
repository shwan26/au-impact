// app/public/event/page.tsx  (or the same file you pasted from)
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type ApiEvent = {
  EventID?: string | number | null;
  Title?: string | null;
  Description?: string | null;
  StartDateTime?: string | null;
  EndDateTime?: string | null;
  Venue?: string | null;
  PosterURL?: string | null;
  Status?: string | null;

  // variants
  eventid?: string | number | null;
  title?: string | null;
  description?: string | null;
  startdatetime?: string | null;
  enddatetime?: string | null;
  venue?: string | null;
  posterurl?: string | null;
  photourl?: string | null;
  photo_url?: string | null;
  status?: string | null;

  // for filters
  Fee?: number | null;
  fee?: number | null;
  MaxStaff?: number | null;
  maxstaff?: number | null;
};

type UIEvent = {
  id: string;
  title: string;
  description: string | null;
  start: string | null;
  end: string | null;
  venue: string | null;
  poster: string | null;
  status: string;
  fee: number | null;
  maxStaff: number | null;
};

function normalize(e: ApiEvent): UIEvent | null {
  const id = e.EventID ?? e.eventid ?? null;
  if (id == null) return null;

  const poster =
    e.PosterURL ?? e.posterurl ?? e.photourl ?? e.photo_url ?? null;

  const feeRaw = (e.Fee ?? e.fee);
  const maxStaffRaw = (e.MaxStaff ?? e.maxstaff);

  return {
    id: String(id),
    title: (e.Title ?? e.title ?? 'Untitled Event') || 'Untitled Event',
    description: e.Description ?? e.description ?? null,
    start: e.StartDateTime ?? e.startdatetime ?? null,
    end: e.EndDateTime ?? e.enddatetime ?? null,
    venue: e.Venue ?? e.venue ?? null,
    poster,
    status: String(e.Status ?? e.status ?? '').toUpperCase(),
    fee: feeRaw == null ? null : Number(feeRaw),
    maxStaff: maxStaffRaw == null ? null : Number(maxStaffRaw),
  };
}

function fmtDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

type PaidFilter = 'all' | 'free' | 'paid';
type StaffFilter = 'all' | 'staff' | 'nostaff';

export default function EventPage() {
  const [items, setItems] = useState<UIEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // search box text and committed query
  const [searchBox, setSearchBox] = useState('');
  const [q, setQ] = useState('');

  // filters
  const [paid, setPaid] = useState<PaidFilter>('all');
  const [staff, setStaff] = useState<StaffFilter>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch('/api/events?status=LIVE', { cache: 'no-store' });
        const text = await res.text();
        if (!res.ok) throw new Error(text || 'Failed to fetch');
        const json = text ? JSON.parse(text) : [];
        const raw: ApiEvent[] = Array.isArray(json) ? json : [];
        const norm = raw.map(normalize).filter(Boolean) as UIEvent[];
        if (!cancelled) setItems(norm);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let out = items;

    // text search in title / venue / description
    const qq = q.trim().toLowerCase();
    if (qq) {
      out = out.filter(e =>
        e.title.toLowerCase().includes(qq) ||
        (e.venue ?? '').toLowerCase().includes(qq) ||
        (e.description ?? '').toLowerCase().includes(qq)
      );
    }

    // paid / free
    if (paid !== 'all') {
      out = out.filter(e => {
        const isPaid = Number(e.fee ?? 0) > 0;
        return paid === 'paid' ? isPaid : !isPaid;
      });
    }

    // staff / no staff
    if (staff !== 'all') {
      out = out.filter(e => {
        const hasStaff = Number(e.maxStaff ?? 0) > 0;
        return staff === 'staff' ? hasStaff : !hasStaff;
      });
    }

    return out;
  }, [items, q, paid, staff]);

  function commitSearch() {
    setQ(searchBox);
  }
  function resetAll() {
    setSearchBox('');
    setQ('');
    setPaid('all');
    setStaff('all');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">Events</h1>

      {/* Search + buttons */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={searchBox}
          onChange={(e) => setSearchBox(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commitSearch(); }}
          placeholder="Search by title, venue, description…"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
        />
        <div className="flex gap-2">
          <button
            onClick={commitSearch}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
          >
            Search
          </button>
          <button
            onClick={resetAll}
            className="rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm hover:bg-zinc-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-zinc-700">Price:</span>
        <Chip active={paid === 'all'} onClick={() => setPaid('all')}>All</Chip>
        <Chip active={paid === 'free'} onClick={() => setPaid('free')}>Free</Chip>
        <Chip active={paid === 'paid'} onClick={() => setPaid('paid')}>Paid</Chip>

        <span className="ml-4 mr-1 text-sm font-semibold text-zinc-700">Staff:</span>
        <Chip active={staff === 'all'} onClick={() => setStaff('all')}>All</Chip>
        <Chip active={staff === 'staff'} onClick={() => setStaff('staff')}>Staff</Chip>
        <Chip active={staff === 'nostaff'} onClick={() => setStaff('nostaff')}>No Staff</Chip>
      </div>

      {/* Content grid (keeps your existing card look) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="col-span-full rounded-lg border border-zinc-200 p-6 text-center text-zinc-600">
            Loading…
          </div>
        )}

        {err && (
          <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {err}
          </div>
        )}

        {!loading && !err && filtered.map((e) => {
          const start = e.start ? (() => {
            const d = new Date(e.start!);
            return isNaN(d.getTime()) ? undefined : d.toLocaleString();
          })() : undefined;

          const end = e.end ? (() => {
            const d = new Date(e.end!);
            return isNaN(d.getTime()) ? undefined : d.toLocaleString();
          })() : undefined;

          return (
            <article key={e.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="aspect-[16/9] bg-zinc-100">
                {e.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.poster} alt={e.title} loading="lazy" className="h-full w-full object-cover" />
                ) : null}
              </div>

              <div className="p-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold tracking-wide text-zinc-500">{e.status}</span>
                  <span className="text-zinc-600">
                    {Number(e.fee ?? 0) > 0 ? 'Paid' : 'Free'} · {Number(e.maxStaff ?? 0) > 0 ? 'Staff' : 'No Staff'}
                  </span>
                </div>

                <h3 className="line-clamp-2 text-base font-semibold">
                  <Link href={`/public/event/${e.id}`} className="hover:underline">
                    {e.title}
                  </Link>
                </h3>

                {(start || end) && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {start}{end ? ` — ${end}` : ''}
                  </p>
                )}

                {e.venue && <p className="mt-1 text-xs text-zinc-500">Venue: {e.venue}</p>}

                {e.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-700">{e.description}</p>
                )}
              </div>
            </article>
          );
        })}

        {!loading && !err && !filtered.length && (
          <div className="col-span-full rounded-lg border border-zinc-200 p-6 text-center text-zinc-600">
            No events found.
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm ${
        active
          ? 'border-zinc-900 bg-zinc-900 text-white'
          : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
      }`}
    >
      {children}
    </button>
  );
}
