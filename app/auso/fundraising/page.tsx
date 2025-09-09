'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useJson } from '@/hooks/useJson';
import type { Fundraising } from '@/types/db';

type Row = { pn: string; name: string; status: string };

export default function AUSOFundraisingPage() {
  const { data, loading, error } =
    useJson<{ items: Fundraising[] }>('/api/fundraising');

  const rows: Row[] = useMemo(() => {
    const items = data?.items ?? [];
    return items.map((f) => ({
      pn: f.id,
      name: f.title,
      status: f.status === 'PENDING' ? 'Pending' : 'Approved',
    }));
  }, [data]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Fundraising</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-300">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr className="border-b border-zinc-300">
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Project Number</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Project Name</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-zinc-900">
            {rows.map((r, i) => (
              <tr key={`${r.pn}-${i}`} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300">{r.pn}</td>
                <td className="px-4 py-3 border-r border-zinc-300">{r.name}</td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  No fundraising projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
