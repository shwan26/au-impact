'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { Merch } from '@/types/db';

function StatusPill({ status }: { status?: Merch['status'] }) {
  const styles = {
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
    SOLD_OUT: 'bg-rose-100 text-rose-700 border-rose-300',
  } as const;
  const cls = styles[status as keyof typeof styles] ?? 'bg-zinc-100 text-zinc-700 border-zinc-300';
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {status ?? 'UNKNOWN'}
    </span>
  );
}

export default function AUSOMerchandisePage() {
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

  const total = useMemo(() => items.length, [items]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Merchandise</h1>
        <Link
          href="/auso/merchandise/create"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
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
                  <td className="px-4 py-3 border-r border-zinc-300">
                    <Link
                      href={`/auso/merchandise/${m.itemId}`}
                      className="underline hover:no-underline"
                    >
                      {m.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={m.status} />
                  </td>
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
            {total > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-xs text-zinc-500">
                    Total: {total}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </main>
  );
}
