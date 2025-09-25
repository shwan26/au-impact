'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useJson } from '@/hooks/useJson';

/** API shape (PascalCase from your /api/events route) */
type ApiItem = {
  EventID: number;
  Title: string;
  Status?: 'PENDING' | 'LIVE' | 'COMPLETE' | 'REJECTED' | 'DRAFT' | 'UNKNOWN' | string;
  StartDateTime?: string | null; // if your API includes it
};

type ApiShape = { items: ApiItem[] };

const TABS = [
  { key: 'PENDING', label: 'Pending', query: { status: 'PENDING' } },
  { key: 'APPROVED', label: 'Approved', query: { statuses: 'LIVE,COMPLETE' } }, // composite filter
  { key: 'LIVE', label: 'Live', query: { status: 'LIVE' } },
  { key: 'COMPLETE', label: 'Complete', query: { status: 'COMPLETE' } },
  { key: 'REJECTED', label: 'Rejected', query: { status: 'REJECTED' } },
  { key: 'DRAFT', label: 'Draft', query: { status: 'DRAFT' } },
  { key: 'ALL', label: 'All', query: {} },
];

function toProjectNumber(id: number | string) {
  const digits = String(id).replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}

function toStatusLabel(s?: ApiItem['Status']) {
  switch ((s ?? '').toUpperCase()) {
    case 'PENDING':
      return 'Pending';
    case 'LIVE':
      return 'Live';
    case 'COMPLETE':
      return 'Complete';
    case 'REJECTED':
      return 'Rejected';
    case 'DRAFT':
      return 'Draft';
    case 'UNKNOWN':
      return 'Unknown';
    default:
      return 'Unknown';
  }
}

function buildEventsUrl(tabKey: string) {
  const found = TABS.find((t) => t.key === tabKey) ?? TABS[0];
  const sp = new URLSearchParams();
  if (found.query.status) sp.set('status', found.query.status);
  if (found.query.statuses) sp.set('statuses', found.query.statuses);
  return `/api/events${sp.toString() ? `?${sp.toString()}` : ''}`;
}

export default function AUSOEventsPage() {
  const search = useSearchParams();
  const router = useRouter();

  const activeTab = (search.get('tab') || 'PENDING').toUpperCase();
  const dataUrl = buildEventsUrl(activeTab);

  // Pull from your API route (which talks to Supabase)
  const { data, loading, error } = useJson<ApiShape>(dataUrl);

  // Normalize for UI
  const items = useMemo(
    () =>
      (data?.items ?? []).map((e) => ({
        id: String(e.EventID),
        title: e.Title ?? 'Untitled',
        status: e.Status,
      })),
    [data]
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Events</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t.key === activeTab;
          const href = (() => {
            const sp = new URLSearchParams(search.toString());
            sp.set('tab', t.key);
            return `/auso/event?${sp.toString()}`;
          })();
        return (
          <Link
            key={t.key}
            href={href}
            className={`rounded-full px-3 py-1 text-sm font-medium border ${
              isActive
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50'
            }`}
            prefetch={false}
          >
            {t.label}
          </Link>
        );})}
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-6 text-zinc-600">Loading…</div>
      ) : error ? (
        <div className="p-6 text-red-600">Error loading events: {error.message}</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-300">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                {['Project Number', 'Project Name', 'Type', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold border-r border-zinc-300 last:border-r-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-zinc-900">
              {items.map((e) => (
                <tr key={e.id} className="border-b border-zinc-300 last:border-b-0">
                  <td className="px-4 py-3 border-r border-zinc-300">
                    {toProjectNumber(e.id)}
                  </td>
                  <td className="px-4 py-3 border-r border-zinc-300">
                    <Link
                      href={`/auso/event/${e.id}`}
                      className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                    >
                      {e.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 border-r border-zinc-300">Event</td>
                  <td className="px-4 py-3">{toStatusLabel(e.status)}</td>
                </tr>
              ))}

              {!items.length && (
                <tr>
                  <td className="px-4 py-6 text-center text-zinc-500" colSpan={4}>
                    No events found{activeTab !== 'ALL' ? ` for ${TABS.find(t=>t.key===activeTab)?.label}` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
