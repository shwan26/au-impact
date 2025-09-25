'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useJson } from '@/hooks/useJson';

type ApiItem = {
  id?: string;
  title?: string;
  status?: string; // 'PENDING' | 'LIVE' | 'COMPLETE' | etc.
};

type Row = {
  id?: string;
  projectNumber: string;
  projectName: string;
  status: 'Approved' | 'Pending';
};

function toStatusLabel(s?: string): 'Approved' | 'Pending' {
  if (!s) return 'Pending';
  return s === 'PENDING' ? 'Pending' : 'Approved'; // treat LIVE/COMPLETE as Approved
}

function toProjectNumber(id: string) {
  const digits = id.replace(/\D/g, '').padStart(6, '0') || '000000';
  return `F${digits}`;
}

export default function AUSOFundraisingPage() {
  // If your API returns a different envelope, tweak the generic below
  const { data, loading, error } = useJson<{ items?: ApiItem[] }>('/api/fundraising');

  const rows: Row[] = useMemo(() => {
    const items = data?.items ?? [];
    return items.map((f) => {
      const safeId = String(f.id ?? '');
      const projectNumber = toProjectNumber(safeId);
      return {
        id: f.id,
        projectNumber,
        projectName: f.title ?? 'NA',
        status: toStatusLabel(f.status),
      };
    });
  }, [data]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Fundraising</h1>
      </div>

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
            {rows.map((r, i) => {
              // ✅ robust unique key
              const rowKey =
                r.id ||
                `${r.projectNumber}-${r.projectName}` ||
                `row-${i}`;

              // ✅ safe link id (don’t call .replace on undefined)
              const linkId =
                r.id ||
                (r.projectNumber ? r.projectNumber.replace(/\D/g, '') : '') ||
                String(i + 1);

              return (
                <tr key={rowKey} className="border-b border-zinc-300 last:border-b-0">
                  <td className="px-4 py-3 border-r border-zinc-300">{r.projectNumber}</td>
                  <td className="px-4 py-3 border-r border-zinc-300">
                    <Link
                      href={`/auso/fundraising/${linkId}`}
                      className="underline decoration-zinc-400 hover:text-zinc-900"
                    >
                      {r.projectName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.status}</td>
                </tr>
              );
            })}

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
