// app/sau/merchandise/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type MerchRow = {
  ItemID: number;
  Title: string;
  Status: 'PENDING' | 'APPROVED' | 'SOLD_OUT' | 'ARCHIVED';
};

export default function SAUMerchandisePage() {
  const [items, setItems] = useState<MerchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/merchandise?sauId=1', { cache: 'no-store' }); // TODO: use real SAU_ID
      const json = await res.json();
      setItems(json.data || []);
      setLoading(false);
    })();
  }, []);

  const statusLabel = (s: MerchRow['Status']) => (s === 'PENDING' ? 'Pending' : s.charAt(0) + s.slice(1).toLowerCase());

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Merchandise</h1>
        <Link href="/sau/merchandise/create" className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50">
          + New Merchandise
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr className="border-b border-zinc-300">
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Project Number</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Merchandise Name</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-zinc-900">
            {loading && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-zinc-500">Loading...</td></tr>
            )}
            {!loading && items.map(m => (
              <tr key={m.ItemID} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300 font-mono">{m.ItemID}</td>
                <td className="px-4 py-3 border-r border-zinc-300">
                  <Link href={`/sau/merchandise/${m.ItemID}`} className="underline hover:no-underline">{m.Title}</Link>
                </td>
                <td className="px-4 py-3">{statusLabel(m.Status)}</td>
              </tr>
            ))}
            {!loading && !items.length && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-zinc-500">No merchandise found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
