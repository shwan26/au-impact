'use client';

import { announcements as mockAnnouncements } from '@/lib/mock';
import type { Announcement } from '@/types/db';
import Link from 'next/link';

function toStatusLabel(s?: Announcement['status']) {
  if (!s) return 'Pending';
  if (s === 'PENDING') return 'Pending';
  if (s === 'LIVE' || s === 'COMPLETE') return 'Approved';
  return s[0] + s.slice(1).toLowerCase();
}

export default function AUSOAnnouncementsPage() {
  const items: Announcement[] = mockAnnouncements();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Announcement</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr className="border-b border-zinc-300">
              <th className="px-4 py-3 text-left font-semibold border-r border-zinc-300">
                Project Number
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
              <tr key={a.id} className="border-b border-zinc-200 last:border-b-0 align-top">
                <td className="px-4 py-3 border-r border-zinc-300">{a.id}</td>
                <td className="px-4 py-3 border-r border-zinc-300">{a.topic}</td>
                <td className="px-4 py-3">{toStatusLabel(a.status)}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-500" colSpan={3}>
                  No announcements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
