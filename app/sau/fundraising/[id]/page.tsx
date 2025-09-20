'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

type ApiItem = {
  id: string | number;
  title: string;
  description?: string | null;
  status?: 'PENDING' | 'LIVE' | 'COMPLETE' | string;
  organizerName?: string | null;
  contactLine?: string | null;
  location?: string | null;
  startDate?: string | null; // ISO
  endDate?: string | null;   // ISO
  goal?: number | null;
  imageUrl?: string | null;
  currentDonation?: number | null;
};

function toProjectNumber(id: string | number | null | undefined) {
  const digits = String(id ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `F${digits}`;
}

export default function SAUEditFundraisingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // Robustly normalize the id from the URL
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';
  const idNum = Number(idStr);
  const hasValidNumericId = Number.isFinite(idNum) && idStr !== '';

  const [item, setItem] = useState<ApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const projectNumber = useMemo(() => toProjectNumber(idStr), [idStr]);

  // Load the fundraising item only if the id is valid
  useEffect(() => {
    if (!hasValidNumericId) {
      setItem(null);
      setErr('Invalid id');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/fundraising/${idNum}`, { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Failed to load');
        if (!cancelled) setItem(json as ApiItem);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading fundraising');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasValidNumericId, idNum]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasValidNumericId || !item) return;

    const fd = new FormData(e.currentTarget);
    const payload: Partial<ApiItem> = {
      title: String(fd.get('title') ?? item.title),
      organizerName: String(fd.get('organizerName') ?? ''),
      contactLine: String(fd.get('contactLine') ?? ''),
      location: String(fd.get('location') ?? ''),
      startDate: (fd.get('startDate') ? String(fd.get('startDate')) : '') || null,
      endDate: (fd.get('endDate') ? String(fd.get('endDate')) : '') || null,
      goal: fd.get('goal') ? Number(fd.get('goal')) : (item.goal ?? null),
      description: String(fd.get('description') ?? ''),
      status: item.status ?? 'PENDING',
    };

    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/fundraising/${idNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to save');
      setItem(json as ApiItem);
      alert('Fundraising saved.');
    } catch (e: any) {
      setErr(e?.message || 'Error while saving');
    } finally {
      setSaving(false);
    }
  }

  async function onClose() {
    if (!hasValidNumericId) return;
    if (!confirm('Close this fundraising?')) return;
    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/fundraising/${idNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETE' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to close');
      setItem(json as ApiItem);
      alert('Fundraising closed.');
      router.push('/sau/fundraising');
    } catch (e: any) {
      setErr(e?.message || 'Error while closing');
    } finally {
      setSaving(false);
    }
  }

  if (!hasValidNumericId) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-red-600 font-medium">Error: Invalid id</p>
        <Link href="/sau/fundraising" className="underline">
          Back to Fundraising list
        </Link>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!item) return <div className="p-6">Fundraising not found.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      {/* Top actions (kept in original place) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Fundraising</h1>
        <div className="flex gap-2">
          <Link
            href={`/sau/fundraising/${idStr}/list`}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
          >
            Fundraising List
          </Link>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-semibold hover:bg-zinc-300 disabled:opacity-60"
          >
            Close Fundraising
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
        <div className="py-2 text-sm font-medium text-zinc-700">Activity Unit</div>
        <div className="py-2">Student Council of Theodore Maria School of Arts</div>

        <div className="py-2 text-sm font-medium text-zinc-700">Project Number</div>
        <div className="py-2 font-mono">{projectNumber}</div>
      </div>

      {/* Edit form (prefilled) */}
      <form onSubmit={onSubmit} className="space-y-4">
        <Row label="Project Name">
          <input
            name="title"
            defaultValue={item.title}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Organizer Name">
          <input
            name="organizerName"
            defaultValue={item.organizerName ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Organizer LineID">
          <input
            name="contactLine"
            defaultValue={item.contactLine ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Event Venue">
          <input
            name="location"
            defaultValue={item.location ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Event Date From / To">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="startDate"
              defaultValue={item.startDate?.slice(0, 10) || ''}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
            />
            <input
              type="date"
              name="endDate"
              defaultValue={item.endDate?.slice(0, 10) || ''}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
            />
          </div>
        </Row>

        <Row label="Expected Money Amount (THB)">
          <input
            type="number"
            name="goal"
            min={0}
            defaultValue={item.goal ?? 0}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Write Caption">
          <textarea
            name="description"
            rows={4}
            defaultValue={item.description ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        {/* Bank fields are UI-only */}
        <Row label="Bank Book Name">
          <input
            name="bankBookName"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
            placeholder="(UI only)"
          />
        </Row>
        <Row label="Bank Book Account">
          <input
            name="bankBookAccount"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
            placeholder="(UI only)"
          />
        </Row>
        <Row label="Bank Name">
          <input
            name="bankName"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
            placeholder="(UI only)"
          />
        </Row>

        <Row label="PromptPay QR code">
          <div className="rounded-md border bg-zinc-50 p-8 text-center text-sm text-zinc-500">
            Upload / manage QR here (UI only)
          </div>
        </Row>

        <Row label="Upload Poster">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
            <span className="text-xl">＋</span>
            <span>Upload .png, .jpg, .jpeg (up to 5 photos)</span>
            <input type="file" accept="image/png,image/jpeg" multiple className="hidden" />
          </label>
        </Row>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
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
