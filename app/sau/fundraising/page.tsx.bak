// app/sau/fundraising/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type ApiFund =
  | {
      // expected from our API mapper
      id?: number | string;
      title?: string;
      status?: 'PENDING' | 'LIVE' | 'COMPLETE' | string;
    }
  | {
      // just in case the API returns raw DB columns
      FundID?: number;
      Title?: string;
      Status?: string;
    };

type Row = {
  key: string;
  id: number | null;
  projectNumber: string;
  projectName: string;
  statusLabel: 'Approved' | 'Pending';
};

function toProjectNumber(id: number | null) {
  if (id == null) return 'F000000';
  const digits = String(id).padStart(6, '0');
  return `F${digits}`;
}

function toStatusLabel(s?: string): 'Approved' | 'Pending' {
  if (!s) return 'Pending';
  const up = s.toUpperCase();
  return up === 'PENDING' ? 'Pending' : 'Approved'; // treat LIVE/COMPLETE as Approved
}

function toNum(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function SAUFundraisingPage() {
  const [items, setItems] = useState<ApiFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch('/api/fundraising', { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Failed to load fundraising');

        // list may be {items:[...]} or just an array; support both
        const arr: ApiFund[] = Array.isArray(json) ? json : Array.isArray(json?.items) ? json.items : [];
        if (!cancel) setItems(arr);
      } catch (e: any) {
        if (!cancel) setErr(e?.message || 'Error loading fundraising');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const rows: Row[] = useMemo(() => {
    return items.map((it, idx) => {
      const id =
        toNum((it as any).id) ??
        toNum((it as any).FundID) ??
        null;

      const title = (it as any).title ?? (it as any).Title ?? '(untitled)';
      const status = (it as any).status ?? (it as any).Status ?? 'PENDING';

      const projectNumber = toProjectNumber(id);
      const key = id != null ? `id-${id}` : `na-${idx}`;

      return {
        key,
        id,
        projectNumber,
        projectName: String(title),
        statusLabel: toStatusLabel(String(status)),
      };
    });
  }, [items]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  return (
    <div className="space-y-4">
      {/* Header + New button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Fundraising</h1>
        <Link
          href="/sau/fundraising/create"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          + New Fundraising
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
                Project Name
              </th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-zinc-900">
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300">{r.projectNumber}</td>
                <td className="px-4 py-3 border-r border-zinc-300">
                  {r.id != null ? (
                    <Link
                      href={`/sau/fundraising/${r.id}`}
                      className="underline decoration-zinc-400 hover:text-zinc-900"
                    >
                      {r.projectName}
                    </Link>
                  ) : (
                    <span className="text-zinc-500">{r.projectName} (no id)</span>
                  )}
                </td>
                <td className="px-4 py-3">{r.statusLabel}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  No fundraising found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
