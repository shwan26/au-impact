'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type ApiItem = {
  announcementid?: number | null;
  topic?: string | null;
  description?: string | null;
  photourl?: string | null;
  dateposted?: string | null; // ISO
  status?: 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string | null;
  sau_id?: number | null;
  auso_id?: number | null;
};

function toAnnouncementNumber(n: number) {
  return `A${String(n).padStart(6, '0')}`;
}
function toStatusLabel(s?: ApiItem['status']) {
  return s === 'PENDING' ? 'Pending' : 'Approved'; // LIVE/COMPLETE => Approved
}

export default function AUSOAnnouncementsPage() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Pull a reasonable page size for the AUSO table
        const res = await fetch('/api/announcements?page=1&pageSize=100', {
          cache: 'no-store',
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error || 'Failed to load announcements');

        if (!cancelled) {
          const arr = Array.isArray(json.items) ? (json.items as ApiItem[]) : [];
          setItems(arr);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load announcements');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => items ?? [], [items]);

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Announcements</h1>
      </div>

      {loading && <p className="text-sm text-zinc-600">Loading…</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {!loading && !err && (
        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">
                  Announcement Number
                </th>
                <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">
                  Announcement Topic
                </th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="text-zinc-900">
              {rows.map((a, i) => {
                // ✅ Stable key: prefer DB id; fall back to a composite; finally the index.
                const key =
                  (a.announcementid ?? undefined) ??
                  (a.topic && a.dateposted ? `${a.topic}-${a.dateposted}` : undefined) ??
                  `row-${i}`;

                // Safe display id for links & numbering
                const displayId = a.announcementid ?? i + 1;

                return (
                  <tr key={key} className="border-b border-zinc-300 last:border-b-0">
                    <td className="px-4 py-3 border-r border-zinc-300">
                      {toAnnouncementNumber(displayId)}
                    </td>

                    <td className="px-4 py-3 border-r border-zinc-300">
                      <Link
                        href={`/auso/announcements/${displayId}`}
                        className="underline decoration-zinc-400 hover:text-zinc-900"
                      >
                        {a.topic ?? '(no topic)'}
                      </Link>
                    </td>

                    <td className="px-4 py-3">{toStatusLabel(a.status)}</td>
                  </tr>
                );
              })}

              {!rows.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                    No announcements found.
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
