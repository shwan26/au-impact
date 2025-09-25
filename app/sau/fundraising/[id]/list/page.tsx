'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Donation = {
  id: number | string;
  name: string;
  amount: number;
  at: string;     // ISO
  slip?: string;  // URL | null
};

export default function SAUFundraisingListPage() {
  const params = useParams<{ id: string }>();
  const idRaw = Array.isArray(params.id) ? params.id[0] : params.id;

  const [rows, setRows] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/fundraising/${encodeURIComponent(idRaw)}/donations`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load donations');
        if (!cancelled) setRows(json.items || []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading donations');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [idRaw]);

  const fmtTHB = (n: number) => n.toLocaleString('en-US');
  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Fundraising List</h1>
        <Link
          href={`/sau/fundraising/${encodeURIComponent(idRaw)}`}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
        >
          Back to Edit
        </Link>
      </div>

      {loading && <div className="text-sm text-zinc-600">Loading…</div>}
      {err && <div className="text-sm text-red-600">Error: {err}</div>}

      <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr className="border-b border-zinc-300">
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">No.</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Donor</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Amount (THB)</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Date &amp; Time</th>
              <th className="px-4 py-3 text-left font-semibold">Receipt URL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={String(d.id) + '-' + i} className="border-b border-zinc-200 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-200">{i + 1}.</td>
                <td className="px-4 py-3 border-r border-zinc-200">{d.name || 'Anonymous'}</td>
                <td className="px-4 py-3 border-r border-zinc-200">{fmtTHB(d.amount)}</td>
                <td className="px-4 py-3 border-r border-zinc-200">{fmtDateTime(d.at)}</td>
                <td className="px-4 py-3">
                  {d.slip ? (
                    <a href={d.slip} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      Open
                    </a>
                  ) : '—'}
                </td>
              </tr>
            ))}
            {!loading && !rows.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  No donations recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
