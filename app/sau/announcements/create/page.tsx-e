'use client';
import { errMsg } from '@/lib/errors';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function SAUNewAnnouncementPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [photourl, setPhotourl] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(status: 'DRAFT' | 'PENDING') {
    try {
      setSaving(true);
      setErr(null);
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Topic: topic,
          Description: description || null,
          PhotoURL: photourl || null,
          Status: status, // ✅ matches DB check constraint
          SAU_ID: null,
          AUSO_ID: null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Create failed');
      alert(status === 'PENDING' ? 'Submitted for review.' : 'Saved as draft.');
      router.push('/sau/announcements');
      router.refresh();
    } catch (e: unknown) {
      setErr(errMsg(e) || 'Create error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-extrabold">Announcement</h1>

      {err && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <Row label="Activity Unit">
        <div className="py-2">Student Council of Theodore Maria School of Arts</div>
      </Row>

      <Row label="Announcement Topic">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="Topic"
        />
      </Row>

      <Row label="Description">
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="Describe your announcement"
        />
      </Row>

      <Row label="Overview Photo URL">
        <input
          value={photourl}
          onChange={(e) => setPhotourl(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="https://…"
        />
      </Row>

      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={saving}
          onClick={() => submit('PENDING')}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Submit for review (PENDING)'}
        </button>
        <button
          disabled={saving}
          onClick={() => submit('DRAFT')}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save draft (DRAFT)'}
        </button>
      </div>
    </div>
  );
}
