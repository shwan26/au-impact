'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { fundraising as mockFundraising } from '@/lib/mock';
import type { Fundraising } from '@/types/db';

type Row = {
  projectNumber: string;
  projectName: string;
  status: 'Approved' | 'Pending';
  id: string;
};

function toStatusLabel(s?: Fundraising['status']): 'Approved' | 'Pending' {
  if (!s) return 'Pending';
  if (s === 'PENDING') return 'Pending';
  // Treat LIVE/COMPLETE as approved in this table
  return 'Approved';
}

function toProjectNumber(id: string) {
  const digits = id.replace(/\D/g, '').padStart(6, '0') || '000000';
  return `F${digits}`;
}

export default function SAUFundraisingPage() {
  // Using mock data; replace with your API if needed
  const items = mockFundraising();

  const rows: Row[] = useMemo(
    () =>
      items.map((f) => ({
        id: f.id,
        projectNumber: toProjectNumber(f.id),
        projectName: f.title,
        status: toStatusLabel(f.status),
      })),
    [items]
  );

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

      {/* AUSO-style table card with vertical separators */}
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
              <tr key={r.id} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300">{r.projectNumber}</td>
                <td className="px-4 py-3 border-r border-zinc-300">
                  <Link
                    href={`/sau/fundraising/${r.id}`}
                    className="underline decoration-zinc-400 hover:text-zinc-900"
                  >
                    {r.projectName}
                  </Link>
                </td>
                <td className="px-4 py-3">{r.status}</td>
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
