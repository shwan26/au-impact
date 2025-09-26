'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ApiItem = {
  AnnouncementID: number;
  Topic: string;
  Description: string | null;
  PhotoURL: string | null;
  DatePosted: string; // ISO
  Status: 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;
  SAU_ID: number | null;
  AUSO_ID: number | null;
};

function toAnnouncementNumber(idLike: number | string) {
  const digits = String(idLike).replace(/\D/g, '').padStart(6, '0') || '000000';
  return `A${digits}`;
}

function toStatusLabel(s?: ApiItem['Status']): 'Approved' | 'Pending' {
  // PENDING => Pending; LIVE/COMPLETE/DRAFT => Approved (match your previous display logic)
  if (!s) return 'Pending';
  return s === 'PENDING' ? 'Pending' : 'Approved';
}

export default function SAUAnnouncementsPage() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let killed = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // Grab up to 100 most recent announcements.
        const res = await fetch('/api/announcements?page=1&pageSize=100', { cache: 'no-store' , credentials: 'include'});
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load announcements');
        if (!killed) setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e: any) {
        if (!killed) setErr(e?.message || 'Error loading announcements');
      } finally {
        if (!killed) setLoading(false);
      }
    })();

    return () => {
      killed = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Header + New button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Announcements</h1>
        <Link
          href="/sau/announcements/create"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          + New Announcement
        </Link>
      </div>

      {loading && (
        <div className="rounded-xl border border-zinc-300 bg-white px-4 py-6 text-sm">
          Loading…
        </div>
      )}

      {err && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

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
                <th className="px-4 py-3 text-left font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-zinc-900">
              {items.map((a) => (
                <tr key={a.AnnouncementID} className="border-b border-zinc-300 last:border-b-0">
                  <td className="px-4 py-3 border-r border-zinc-300">
                    {toAnnouncementNumber(a.AnnouncementID)}
                  </td>
                  <td className="px-4 py-3 border-r border-zinc-300">
                    <Link
                      href={`/sau/announcements/${a.AnnouncementID}`}
                      className="underline decoration-zinc-400 hover:text-zinc-900"
                    >
                      {a.Topic}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {toStatusLabel(a.Status)}
                  </td>
                </tr>
              ))}

              {!items.length && (
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
    </div>
  );
}
