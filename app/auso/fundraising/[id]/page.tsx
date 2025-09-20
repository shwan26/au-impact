// app/auso/fundraising/[id]/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

/** DB-ish shape (actual DB ends up lowercase if created unquoted) */
type DbShape = {
  FundID: number;
  Title: string;
  Description: string | null;
  PosterURL: string | null;
  OrgName: string | null;
  OrgLineID: string | null;
  Location: string | null;
  ExpectedAmount: number | null;
  CurrentAmount: number | null;
  Status?: 'PENDING' | 'LIVE' | 'COMPLETE' | 'DRAFT';
};

/** Camel-case shape that some API variants return */
type CamelShape = {
  id: number | string;
  title: string;
  description?: string | null;
  posterUrl?: string | null;
  imageUrl?: string | null;
  organizerName?: string | null;
  organizerLine?: string | null;
  location?: string | null;
  goal?: number | null;
  currentDonation?: number | null;
  status?: 'PENDING' | 'LIVE' | 'COMPLETE' | 'DRAFT';
};

function normalize(row: Partial<DbShape & CamelShape>) {
  const idAny = (row.FundID ?? row.id) as number | string | undefined;
  const id =
    typeof idAny === 'number'
      ? idAny
      : Number(String(idAny ?? '0').replace(/\D/g, '')) || 0;

  const poster =
    (row.PosterURL as string | null | undefined) ??
    row.posterUrl ??
    row.imageUrl ??
    null;

  const status =
    (row.Status as DbShape['Status']) ??
    (row.status as CamelShape['status']) ??
    ('PENDING' as const);

  return {
    id,
    title: (row.Title ?? row.title ?? '') as string,
    description: (row.Description ?? row.description ?? '') as string | null,
    posterUrl: poster,
    orgName: (row.OrgName ?? row.organizerName ?? '') as string | null,
    orgLine: (row.OrgLineID ?? row.organizerLine ?? '') as string | null,
    location: (row.Location ?? row.location ?? '') as string | null,
    expectedAmount:
      (row.ExpectedAmount ?? row.goal ?? null) as number | null,
    currentAmount:
      (row.CurrentAmount ?? row.currentDonation ?? null) as number | null,
    status,
  };
}

function toProjectNumber(idLike: string | number) {
  const digits = String(idLike).replace(/\D/g, '').padStart(6, '0') || '000000';
  return `F${digits}`;
}

export default function AUSOEditFundraisingPage() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const idNum = Number(rawId);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [title, setTitle] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgLine, setOrgLine] = useState('');
  const [location, setLocation] = useState('');
  const [expected, setExpected] = useState(''); // string for input
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [status, setStatus] =
    useState<'PENDING' | 'LIVE' | 'COMPLETE' | 'DRAFT'>('PENDING');

  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/fundraising/${idNum}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load (HTTP ${res.status})`);
        const json = await res.json();
        const n = normalize(json);

        if (!cancelled) {
          setTitle(n.title ?? '');
          setOrgName(n.orgName ?? '');
          setOrgLine(n.orgLine ?? '');
          setLocation(n.location ?? '');
          setExpected(
            n.expectedAmount == null ? '' : String(Number(n.expectedAmount))
          );
          setDescription(n.description ?? '');
          setPosterUrl(n.posterUrl ?? '');
          setStatus(n.status);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [idNum]);

  const projectNumber = useMemo(() => toProjectNumber(idNum), [idNum]);

  async function doUpdate(payload: Record<string, any>) {
    const res = await fetch(`/api/fundraising/${idNum}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Update failed (HTTP ${res.status})`);
    }
    try { await res.json(); } catch { /* ignore empty body */ }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const expectedNumber =
        expected.trim() === '' ? null : Number.isNaN(Number(expected)) ? null : Number(expected);

      // Send both naming styles so your API accepts at least one
      const payload = {
        // DB-style (lowercase at DB-level), but we send with original case too:
        Title: title.trim(),
        Description: description.trim() || null,
        PosterURL: posterUrl.trim() || null,
        OrgName: orgName.trim() || null,
        OrgLineID: orgLine.trim() || null,
        Location: location.trim() || null,
        ExpectedAmount: expectedNumber,
        Status: status,

        // camelCase mirrors (if your route whitelists camelCase)
        title: title.trim(),
        description: description.trim() || null,
        posterUrl: posterUrl.trim() || null,
        organizerName: orgName.trim() || null,
        organizerLine: orgLine.trim() || null,
        location: location.trim() || null,
        goal: expectedNumber,
        status: status,
      };

      await doUpdate(payload);
      alert('Saved.');
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  // Approve / Not Approve stay in the original "Status" row below.
  // To avoid "No updatable fields", we always include current title as a no-op field.
  async function approve() {
    setActing('approve');
    setError(null);
    try {
      await doUpdate({
        Status: 'LIVE',
        status: 'LIVE',
        Title: title.trim(),
        title: title.trim(),
      });
      setStatus('LIVE');
      alert('Approved.');
    } catch (e: any) {
      setError(e?.message || 'Approve failed');
    } finally {
      setActing(null);
    }
  }

  async function notApprove() {
    setActing('reject');
    setError(null);
    try {
      await doUpdate({
        Status: 'PENDING',
        status: 'PENDING',
        Title: title.trim(),
        title: title.trim(),
      });
      setStatus('PENDING');
      alert('Marked as Not Approved.');
    } catch (e: any) {
      setError(e?.message || 'Not-approve failed');
    } finally {
      setActing(null);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-extrabold">Fundraising</h1>

      {/* Meta */}
      <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
        <div className="py-2 text-sm font-medium text-zinc-700">Activity Unit</div>
        <div className="py-2">Student Council of Theodore Maria School of Arts</div>

        <div className="py-2 text-sm font-medium text-zinc-700">Project Number</div>
        <div className="py-2 font-mono">{projectNumber}</div>
      </div>

      {/* Edit form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <Row label="Project Name">
          <input
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Organizer Name">
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.currentTarget.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Organizer LineID">
          <input
            value={orgLine}
            onChange={(e) => setOrgLine(e.currentTarget.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Event Venue">
          <input
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Expected Money Amount (THB)">
          <input
            type="number"
            min={0}
            value={expected}
            onChange={(e) => setExpected(e.currentTarget.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Write Caption">
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        <Row label="Poster URL">
          <input
            placeholder="https://..."
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.currentTarget.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none"
          />
        </Row>

        {/* ORIGINAL PLACE: Status row with Approve / Not Approve buttons */}
        <Row label="Status">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                status === 'LIVE'
                  ? 'bg-green-100 text-green-800'
                  : status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : status === 'COMPLETE'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-zinc-100 text-zinc-800'
              }`}
            >
              {status}
            </span>

            <button
              type="button"
              onClick={approve}
              disabled={acting !== null}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {acting === 'approve' ? 'Approving…' : 'Approve'}
            </button>
            <button
              type="button"
              onClick={notApprove}
              disabled={acting !== null}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            >
              {acting === 'reject' ? 'Updating…' : 'Not Approve'}
            </button>
          </div>
        </Row>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/auso/fundraising')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={saving}
            className="ml-auto rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-60"
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
