'use client';

import Link from 'next/link';
import { merches } from '@/lib/mock';
import type { Merch } from '@/types/db';

export default function SAUMerchandisePage() {
  const items: Merch[] = merches;

  const statusLabel = (m: Merch) =>
    (m as any).status === 'PENDING' ? 'Pending' : 'Approved';

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      {/* Header + New */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Merchandise</h1>
        <Link
          href="/sau/merchandise/create"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          + New Merchandise
        </Link>
      </div>

      {/* Table */}
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
            {items.map((m) => (
              <tr key={m.itemId} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300 font-mono">
                  {m.itemId}
                </td>

                {/* 👇 name links to detail page */}
                <td className="px-4 py-3 border-r border-zinc-300">
                  <Link
                    href={`/sau/merchandise/${m.itemId}`}
                    className="underline hover:no-underline"
                  >
                    {m.title}
                  </Link>
                </td>

                <td className="px-4 py-3">{statusLabel(m)}</td>
              </tr>
            ))}
            {!items.length && (
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
