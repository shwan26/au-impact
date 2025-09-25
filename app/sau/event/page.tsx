'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useJson } from '@/hooks/useJson';

type ApiEvent = {
  EventID: string | number | null;
  Title?: string | null;
  Description?: string | null;
  Status?: 'PENDING' | 'APPROVED' | 'LIVE' | 'COMPLETE' | 'REJECTED' | 'DRAFT' | string | null;
  StartDate?: string | null;
  EndDate?: string | null;
  Location?: string | null;
  PhotoURL?: string | null;
};
type ApiResponse = { items: ApiEvent[]; total?: number };

const TABS = ['ALL', 'PENDING', 'APPROVED', 'LIVE', 'COMPLETE', 'REJECTED', 'DRAFT'] as const;
type Tab = typeof TABS[number];

function toStatusTab(s?: ApiEvent['Status']): Tab {
  const v = String(s || '').toUpperCase() as Tab;
  return (TABS as readonly string[]).includes(v) ? (v as Tab) : 'ALL';
}

function toStatusLabel(s?: ApiEvent['Status']) {
  switch (String(s || '').toUpperCase()) {
    case 'PENDING': return 'Pending';
    case 'APPROVED': return 'Approved';
    case 'LIVE': return 'Live';
    case 'COMPLETE': return 'Complete';
    case 'REJECTED': return 'Rejected';
    case 'DRAFT': return 'Draft';
    default: return 'Unknown';
  }
}

export default function SAUEventsPage() {
  // IMPORTANT: fetch ALL; filter locally by tab
  const { data, loading, error } = useJson<ApiResponse>('/api/events');
  const [active, setActive] = useState<Tab>('ALL');

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    const filtered = active === 'ALL'
      ? items
      : items.filter((e) => toStatusTab(e.Status) === active);

    return filtered.map((e) => {
      const id = String(e.EventID ?? '');
      const digits = id.replace(/\D/g, '').padStart(6, '0') || '000000';
      const title = (e.Title ?? '').toString().trim() || 'Untitled';
      return {
        id,
        projectNumber: `E${digits}`,
        name: title,
        type: 'Event',
        statusLabel: toStatusLabel(e.Status),
      };
    });
  }, [data, active]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Events</h1>
        <Link
          href="/sau/event/create"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          + New Event
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t === active;
          return (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`rounded-full px-3 py-1 text-sm border ${
                isActive
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {t[0] + t.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Loading / error */}
      {loading && <div className="p-6 text-zinc-600">Loading…</div>}
      {error && <div className="p-6 text-red-600">Error loading events: {error.message}</div>}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-300">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr className="border-b border-zinc-300">
              {['Project Number', 'Project Name', 'Type', 'Status', ''].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-left font-semibold border-r border-zinc-300 ${
                    i === 4 ? 'w-1/6 text-right' : ''
                  } last:border-r-0`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-zinc-900">
            {rows.map((r) => (
              <tr key={r.id || crypto.randomUUID()} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300">{r.projectNumber}</td>
                <td className="px-4 py-3 border-r border-zinc-300">
                  <Link href={`/sau/event/${r.id}`} className="underline decoration-zinc-400 hover:text-zinc-900">
                    {r.name}
                  </Link>
                </td>
                <td className="px-4 py-3 border-r border-zinc-300">{r.type}</td>
                <td className="px-4 py-3 border-r border-zinc-300">{r.statusLabel}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link
                      href={`/sau/event/${r.id}`}
                      className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs hover:bg-zinc-50"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/sau/event/${r.id}/participants`}
                      className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs hover:bg-zinc-50"
                    >
                      Participants/Staff
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-500" colSpan={5}>
                  No events in this tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Optional: total count */}
      {/* {data?.total && <div className="text-xs text-zinc-500">Total events: {data.total}</div>} */}
    </div>
  );
}
