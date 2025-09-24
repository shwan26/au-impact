'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Status = 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;

type ApiRow = {
  AnnouncementID: number;
  Topic: string | null;
  Description: string | null;
  PhotoURL: string | null;
  DatePosted: string | null;
  Status: Status | null;
  SAU_ID: number | null;
  AUSO_ID: number | null;
};

type UiRow = {
  announcementid: number;
  topic: string | null;
  description: string | null;
  photourl: string | null;
  dateposted: string | null;
  status: Status | null;
  sau_id: number | null;
  auso_id: number | null;
};

function fromApi(r: ApiRow): UiRow {
  return {
    announcementid: r.AnnouncementID,
    topic: r.Topic,
    description: r.Description,
    photourl: r.PhotoURL,
    dateposted: r.DatePosted,
    status: r.Status,
    sau_id: r.SAU_ID,
    auso_id: r.AUSO_ID,
  };
}

function toAnnouncementNumber(n: number) {
  return `A${String(n).padStart(6, '0')}`;
}
function toStatusLabel(s?: Status | null) {
  return s === 'PENDING' ? 'Pending' : 'Approved';
}

export default function AUSOAnnouncementsPage() {
  const [items, setItems] = useState<UiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch('/api/announcements?page=1&pageSize=100', { cache: 'no-store' });
        const text = await res.text();
        if (!res.ok) throw new Error(text || 'Failed to load announcements');
        const json = text ? JSON.parse(text) : { items: [] };
        const arr = Array.isArray(json.items) ? (json.items as ApiRow[]) : [];
        if (!cancelled) setItems(arr.map(fromApi));
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load announcements');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => items ?? [], [items]);

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Announcements</h1>
      </div>

      {loading && <p className="text-sm text-zinc-600">Loading…</p>}
      {err && <p className="text-sm text-red-600">{String(err)}</p>}

      {!loading && !err && (
        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Announcement Number</th>
                <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">Announcement Topic</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-zinc-900">
              {rows.map((a, i) => {
                const key =
                  a.announcementid ??
                  (a.topic && a.dateposted ? `${a.topic}-${a.dateposted}` : undefined) ??
                  `row-${i}`;
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
