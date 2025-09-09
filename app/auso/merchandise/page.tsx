'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useJson } from '@/hooks/useJson';
import { merches as merchandiseMock } from '@/lib/mock';
import type { Merch, Status } from '@/types/db';

type ApiShape = { items: Merch[] };

function toStatusLabel(s?: Status) {
  return s === 'PENDING' ? 'Pending' : 'Approved';
}

export default function AUSOMerchandisePage() {
  const { data, loading, error } = useJson<ApiShape>('/api/merchandise');

  const source = data?.items ?? merchandiseMock;
  const rows = useMemo(
    () =>
      source.map((m) => ({
        pn: m.itemId,
        name: m.title,
        status: toStatusLabel((m as any).status),
      })),
    [source]
  );

  if (loading && !data) return <div>Loading…</div>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {error && (
        <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
          Couldn’t reach <code>/api/merchandise</code>. Showing mock data instead.
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Merchandise</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr className="border-b border-zinc-300">
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">
                Project Number
              </th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">
                Merchandise Name
              </th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-zinc-900">
            {rows.map((r) => (
              <tr key={r.pn} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300">{r.pn}</td>
                <td className="px-4 py-3 border-r border-zinc-300">{r.name}</td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  No merchandise found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
