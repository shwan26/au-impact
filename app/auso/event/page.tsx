// app/sau/event/page.tsx
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useJson } from '@/hooks/useJson';
import type { Event } from '@/types/db';

type Row = {
  'Project Number': string;
  'Project Name': string;
  'Type': string;
  'Status': string;
};

export default function SAUEventsPage() {
  const { data, loading, error } = useJson<{ items: Event[] }>('/api/events');

  const rows: Row[] = useMemo(() => {
    const items = data?.items ?? [];
    return items.map((e) => ({
      'Project Number': e.id,
      'Project Name': e.title,
      'Type': 'Event',
      'Status':
        e.status === 'PENDING'
          ? 'Pending'
          : e.status === 'COMPLETE'
          ? 'Approved'
          : 'Approved',
    }));
  }, [data]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {/* Header + New button (➡️ points to your existing path) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Events</h1>
      </div>

      {/* AUSO-style table card */}
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
            {rows.map((r, i) => (
              <tr key={`${r['Project Number']}-${i}`} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300">{r['Project Number']}</td>
                <td className="px-4 py-3 border-r border-zinc-300">{r['Project Name']}</td>
                <td className="px-4 py-3 border-r border-zinc-300">{r['Type']}</td>
                <td className="px-4 py-3">{r['Status']}</td>
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
