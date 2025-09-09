'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getAnnouncementById } from '@/lib/mock';
import type { Announcement } from '@/types/db';

function toAnnouncementNumber(id: string) {
  const digits = id.replace(/\D/g, '').padStart(6, '0') || '000000';
  return `A${digits}`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function SAUEditAnnouncementPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const a = getAnnouncementById(id);
  if (!a) return <div className="p-6">Announcement not found.</div>;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // UI-only per your request (no backend call)
    alert('Announcement saved (demo).');
    // stay on page or go back:
    // router.push('/sau/announcements');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Announcement</h1>
        <Link
          href="/sau/announcements"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
        >
          Back to List
        </Link>
      </div>

      {/* Meta */}
      <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
        <div className="py-2 text-sm font-medium text-zinc-700">Activity Unit</div>
        <div className="py-2">Student Council of Theodore Maria School of Arts</div>

        <div className="py-2 text-sm font-medium text-zinc-700">Announcement Number</div>
        <div className="py-2 font-mono">{toAnnouncementNumber(a.id)}</div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <Row label="Announcement Topic">
          <input
            defaultValue={a.topic}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Description">
          <textarea
            rows={4}
            defaultValue={a.description ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Overview Photo">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
            <span className="text-xl">＋</span>
            <span>Upload .png, .jpg, .jpeg</span>
            <input type="file" accept="image/png,image/jpeg" className="hidden" />
          </label>
        </Row>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
