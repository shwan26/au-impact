'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function CartPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/cart', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load cart');
        setRows(await res.json());
      } catch (e: any) {
        setErr(e?.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const headers = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        <Link href="/public/merchandise" className="text-sm underline">
          Continue shopping →
        </Link>
      </div>

      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-zinc-600">Your cart is empty.</div>
      ) : (
        <div className="overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="border-b px-3 py-2 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  {headers.map((h) => (
                    <td key={h} className="px-3 py-2">
                      {String(r[h])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
