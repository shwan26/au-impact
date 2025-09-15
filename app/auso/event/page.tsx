'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useJson } from '@/hooks/useJson';
import type { Event } from '@/types/db';

type ApiShape = { items: Event[] };

function toProjectNumber(e: Event) {
  const digits = String(e.id ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}
function toStatusLabel(s?: Event['status']) {
  if (s === 'PENDING') return 'Pending';
  if (s === 'COMPLETE' || s === 'LIVE') return 'Approved';
  return 'Approved';
}

export default function AUSOEventsPage() {
  const { data, loading, error } = useJson<ApiShape>('/api/events');

  const items = useMemo<Event[]>(() => data?.items ?? [], [data]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Events</h1>

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
                <td className="px-4 py-3 border-r border-zinc-300">{toProjectNumber(e)}</td>

                {/* 👉 Clickable name */}
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
