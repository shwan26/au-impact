'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function genAnnNumber() {
  return `A${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function SAUNewAnnouncementPage() {
  const router = useRouter();
  const [annNo, setAnnNo] = useState('');
  useEffect(() => setAnnNo(genAnnNumber()), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // If you have an API, call it here and ignore errors for now.
    // await fetch('/api/announcements', { method: 'POST', body: new FormData(e.currentTarget) });

    // ✅ Always navigate back to the SAU list (plural)
    router.push('/sau/announcements');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Announcement</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        {/* Activity Unit */}
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        {/* Announcement Number */}
        <Row label="Announcement Number">
          <div className="py-2 font-mono">{annNo || '—'}</div>
          <input type="hidden" name="announcementNumber" value={annNo} />
        </Row>

        <Field label="Announcement Topic" name="topic" />
        <Row label="Description">
          <textarea name="description" rows={4}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200" />
        </Row>

        <Row label="Overview Photo">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
            <span className="text-xl">＋</span>
            <span>Upload .png, .jpg, .jpeg</span>
            <input type="file" name="photo" accept="image/png,image/jpeg" className="hidden" />
          </label>
        </Row>

        <button type="submit"
          className="rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300">
          Submit
        </button>
      </form>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, name }: { label: string; name: string }) {
  return (
    <Row label={label}>
      <input name={name}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200" />
    </Row>
  );
}
