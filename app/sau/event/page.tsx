'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useJson } from '@/hooks/useJson';
import type { Event } from '@/types/db';

type Row = {
  id: string;
  projectNumber: string;
  name: string;
  type: string;
  statusLabel: string;
};

function toStatusLabel(s?: Event['status']) {
  if (!s) return 'Pending';
  if (s === 'PENDING') return 'Pending';
  if (s === 'LIVE' || s === 'COMPLETE') return 'Approved';
  return s;
}

export default function SAUEventsPage() {
  const { data, loading, error } = useJson<{ items: Event[] }>('/api/events');

  const rows: Row[] = useMemo(() => {
    const items = data?.items ?? [];
    return items.map((e) => {
      const digits = String(e.id ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
      return {
        id: e.id,
        projectNumber: `E${digits}`,
        name: e.title,
        type: 'Event',
        statusLabel: toStatusLabel(e.status),
      };
    });
  }, [data]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Events</h1>
        <Link
          href="/sau/event/create"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          + New Event
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-300">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr className="border-b border-zinc-300">
              {['Project Number', 'Project Name', 'Type', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold border-r border-zinc-300 last:border-r-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-zinc-900">
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300">{r.projectNumber}</td>
                <td className="px-4 py-3 border-r border-zinc-300">
                  <Link href={`/sau/event/${r.id}`} className="underline decoration-zinc-400 hover:text-zinc-900">
                    {r.name}
                  </Link>
                </td>
                <td className="px-4 py-3 border-r border-zinc-300">{r.type}</td>
                <td className="px-4 py-3">{r.statusLabel}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-500" colSpan={4}>
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
