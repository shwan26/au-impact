// app/sau/merchandise/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import type { Merch } from '@/types/db';

export default function SAUMerchandisePage() {
  const [items, setItems] = useState<Merch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/merchandise', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch merchandise');
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error(err);
        setError('Couldn’t load merchandise. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Merchandise</h1>
        <Link href="/sau/merchandise/create" className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50">
          + New Merchandise
        </Link>
      </div>

      {/* Error */}
      {error && <div className="text-red-600">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">
                  Merchandise Number
                </th>
                <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">
                  Merchandise Name
                </th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-zinc-900">
              {items.map((m) => {
                const displayNo = `M${String(m.itemId).padStart(4, '0')}`; // e.g., M0004
                return (
                  <tr key={m.slug} className="border-b border-zinc-300 last:border-b-0">
                    <td className="px-4 py-3 border-r border-zinc-300 font-mono">
                      {displayNo}
                    </td>
                    <td className="px-4 py-3 border-r border-zinc-300">
                      <Link
                        href={`/sau/merchandise/${m.slug}`} // numeric id for the route
                        className="underline hover:no-underline"
                      >
                        {m.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{m.status}</td>
                  </tr>
                );
              })}
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
      )}
    </main>
  );
}
