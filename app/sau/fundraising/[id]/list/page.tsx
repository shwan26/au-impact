'use client';

import Link from 'next/link';
import { announcements as mockAnnouncements } from '@/lib/mock';
import type { Announcement } from '@/types/db';

function toAnnouncementNumber(id: string) {
  const digits = id.replace(/\D/g, '').padStart(6, '0') || '000000';
  return `A${digits}`;
}
function toStatusLabel(s?: Announcement['status']): 'Approved' | 'Pending' {
  if (!s) return 'Pending';
  return s === 'PENDING' ? 'Pending' : 'Approved'; // LIVE/COMPLETE → Approved
}

export default function SAUAnnouncementsPage() {
  const items = mockAnnouncements();

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

      {/* Table */}
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
            {items.map((a) => (
              <tr key={a.id} className="border-b border-zinc-300 last:border-b-0">
                <td className="px-4 py-3 border-r border-zinc-300">{toAnnouncementNumber(a.id)}</td>
                <td className="px-4 py-3 border-r border-zinc-300">
                  <Link
                    href={`/sau/announcements/${a.id}`}
                    className="underline decoration-zinc-400 hover:text-zinc-900"
                  >
                    {a.topic}
                  </Link>
                </td>
                <td className="px-4 py-3">{toStatusLabel(a.status)}</td>
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
    </div>
  );
}
