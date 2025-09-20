'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CreatePayload = {
  Topic: string;
  Description?: string | null;
  PhotoURL?: string | null;
  Status?: 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE';
  SAU_ID?: number | null;
  AUSO_ID?: number | null;
};

export default function CreateAnnouncementPage() {
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState<CreatePayload['Status']>('DRAFT');
  const [sauId, setSauId] = useState<string>('');   // store as string, convert to number/null on submit
  const [ausoId, setAusoId] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    if (!topic.trim()) {
      setErr('Topic is required.');
      return;
    }

    const payload: CreatePayload = {
      Topic: topic.trim(),
      Description: description.trim() || null,
      PhotoURL: photoUrl.trim() || null,
      Status: status ?? 'DRAFT',
      SAU_ID: sauId ? Number(sauId) : null,
      AUSO_ID: ausoId ? Number(ausoId) : null,
    };

    setSaving(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Create failed');

      // json is the created record (mapped). It has AnnouncementID.
      const id = String(json.AnnouncementID);
      // Go to the AUSO detail editor for this new announcement
      router.push(`/auso/announcements/${id}`);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Create Announcement</h1>

      {err && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Announcement Topic *">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Welcome Fair 2025"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details, time, place, etc."
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Field>

        <Field label="Photo URL">
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Field>

        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CreatePayload['Status'])}
            className="w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PENDING">PENDING</option>
            <option value="LIVE">LIVE</option>
            <option value="COMPLETE">COMPLETE</option>
          </select>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="SAU_ID (optional)">
            <input
              value={sauId}
              onChange={(e) => setSauId(e.target.value)}
              placeholder="e.g., 1"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </Field>
          <Field label="AUSO_ID (optional)">
            <input
              value={ausoId}
              onChange={(e) => setAusoId(e.target.value)}
              placeholder="e.g., 1"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </Field>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Link
            href="/auso/announcements"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-zinc-700">{label}</div>
      {children}
    </div>
  );
}
