// app/sau/event/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function toISOOrNull(v: FormDataEntryValue | null) {
  const s = (v ?? '').toString().trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

const STATUS_ALLOWED = new Set(['PENDING', 'LIVE', 'COMPLETE', 'APPROVED', 'REJECTED', 'DRAFT']);

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setErr(null);

    const fd = new FormData(e.currentTarget);

    // Read fields
    const title = (fd.get('title') || '').toString().trim();
    const description = (fd.get('description') || '').toString().trim() || null;
    const photoUrl = (fd.get('photoUrl') || '').toString().trim() || null;
    const location = (fd.get('location') || '').toString().trim() || null;
    const startISO = toISOOrNull(fd.get('start'));
    const endISO = toISOOrNull(fd.get('end'));
    const rawStatus = (fd.get('status') || 'PENDING').toString().toUpperCase();
    const status = STATUS_ALLOWED.has(rawStatus) ? rawStatus : 'PENDING';

    // Basic validation
    if (!title) {
      setErr('Title is required.');
      return;
    }
    if (startISO && endISO && new Date(startISO) > new Date(endISO)) {
      setErr('End date/time must be after start date/time.');
      return;
    }
    if (photoUrl && !/^https?:\/\/.+/i.test(photoUrl)) {
      setErr('Poster URL must start with http(s)://');
      return;
    }

    // Build payload the API understands (PascalCase keys)
    const payload = {
      Title: title,
      Description: description,
      // Keep PhotoURL; ensure your API route reads PhotoURL (or map it there)
      PhotoURL: photoUrl || null,
      Location: location || null,
      StartDate: startISO,
      EndDate: endISO,
      Status: status,
      // SAU_ID / AUSO_ID can be added later if needed
    };

    try {
      setSaving(true);
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to create event');

      router.push('/sau/event?created=1');
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-extrabold">Create Event</h1>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Title" name="title" required />

        <Field label="Location" name="location" />

        <Row label="Start / End">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="start"
              type="datetime-local"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
            <input
              name="end"
              type="datetime-local"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </div>
        </Row>

        <Field
          label="Poster URL (optional)"
          name="photoUrl"
          placeholder="https://…"
        />

        <Row label="Status">
          <select
            name="status"
            defaultValue="PENDING"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          >
            <option value="PENDING">Pending</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETE">Complete</option>
            {/* You can include these if AUSO/Chairperson uses the same form: */}
            {/* <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option> */}
          </select>
        </Row>

        <Row label="Description">
          <textarea
            name="description"
            rows={5}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-900 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- small UI helpers ---------- */

function Row({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[180px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <Row label={label}>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </Row>
  );
}
