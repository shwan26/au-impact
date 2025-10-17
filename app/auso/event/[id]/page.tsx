// app/auso/event/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type ApiEvent = {
  EventID?: string | number | null;
  Title?: string | null;
  Description?: string | null;
  PhotoURL?: string | null;
  PosterURL?: string | null;
  Location?: string | null;
  Venue?: string | null;
  StartDate?: string | null;
  EndDate?: string | null;
  StartDateTime?: string | null;
  EndDateTime?: string | null;
  Status?: string | null;
  ScholarshipHours?: number | null;
  OrganizerLineID?: string | null;
  LineGpURL?: string | null;
  LineGpQRCode?: string | null;
  Fee?: number | null;
  BankName?: string | null;
  BankAccountNo?: string | null;
  BankAccountName?: string | null;
  PromptPayQR?: string | null;
};

type UIEvent = {
  id: string;
  title: string;
  description: string;
  photoUrl: string | null;
  location: string | null;
  start: string | null;
  end: string | null;
  status: string;
  scholarshipHours: number | null;
  organizerLineId: string | null;
  lineGroupUrl: string | null;
  lineGroupQr: string | null;
  fee: number | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankAccountName: string | null;
  promptPayQr: string | null;
};

function statusLabel(s?: string | null) {
  const v = String(s || '').toUpperCase();
  if (v === 'PENDING') return 'PENDING';
  if (v === 'APPROVED') return 'APPROVED';
  if (v === 'LIVE') return 'LIVE';
  if (v === 'COMPLETE') return 'COMPLETE';
  if (v === 'REJECTED') return 'REJECTED';
  if (v === 'DRAFT') return 'DRAFT';
  return 'UNKNOWN';
}

export default function AUSOEventModeratePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState<UIEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/events/${id}`, { cache: 'no-store' });
        const txt = await res.text();
        const json: ApiEvent | null = txt ? JSON.parse(txt) : null;
        if (!res.ok || !json) throw new Error((json as any)?.error || 'Failed to load event');

        const ui: UIEvent = {
          id: String(json.EventID ?? ''),
          title: (json.Title ?? 'Untitled Event') || 'Untitled Event',
          description: json.Description ?? '',
          photoUrl: json.PhotoURL ?? json.PosterURL ?? null,
          location: json.Location ?? json.Venue ?? null,
          start: json.StartDate ?? json.StartDateTime ?? null,
          end: json.EndDate ?? json.EndDateTime ?? null,
          status: String(json.Status ?? 'PENDING').toUpperCase(),
          scholarshipHours: typeof json.ScholarshipHours === 'number' ? json.ScholarshipHours : null,
          organizerLineId: json.OrganizerLineID ?? null,
          lineGroupUrl: json.LineGpURL ?? null,
          lineGroupQr: json.LineGpQRCode ?? null,
          fee: typeof json.Fee === 'number' ? json.Fee : null,
          bankName: json.BankName ?? null,
          bankAccountNo: json.BankAccountNo ?? null,
          bankAccountName: json.BankAccountName ?? null,
          promptPayQr: json.PromptPayQR ?? null,
        };

        if (!cancelled) setData(ui);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading event');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function setStatus(next: 'LIVE' | 'PENDING') {
    if (!data) return;
    if (data.status === next) return;
    const confirmMsg =
      next === 'LIVE'
        ? 'Approve this event and set status to LIVE?'
        : 'Set status to PENDING (not approved)?';
    if (!confirm(confirmMsg)) return;

    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/events/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: next }),
      });
      const txt = await res.text();
      const j = txt ? JSON.parse(txt) : null;
      if (!res.ok || !j) throw new Error(j?.error || 'Failed to update status');
      setData((prev) => (prev ? { ...prev, status: next } : prev));
      alert(`Status updated to ${next}.`);
    } catch (e: any) {
      setErr(e?.message || 'Error updating status');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">Event not found.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Event Moderation</h1>

      {/* Read-only info snapshot (simple) */}
      <div className="mt-4 space-y-4">
        <Row label="Project Name">
          <div className="py-2">{data.title}</div>
        </Row>
        <Row label="Event Venue">
          <div className="py-2">{data.location || '-'}</div>
        </Row>
        <Row label="Description">
          <div className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
            {data.description || '-'}
          </div>
        </Row>
      </div>

      {/* Status (readonly display) */}
      <div className="mt-8 rounded-2xl border border-zinc-200 p-4">
        <Row label="Status">
          <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-semibold">
            {statusLabel(data.status)}
          </div>
        </Row>
      </div>

      {/* Actions */}
      <div className="mt-6">
        <Row label="Actions">
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setStatus('LIVE')}
              disabled={saving || data.status === 'LIVE'}
              className="rounded-xl bg-black px-6 py-3 text-base font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              Approve (LIVE)
            </button>
            <button
              type="button"
              onClick={() => setStatus('PENDING')}
              disabled={saving || data.status === 'PENDING'}
              className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-base font-semibold hover:bg-zinc-50 disabled:opacity-40"
            >
              Not approve (PENDING)
            </button>
            <button
              type="button"
              onClick={() => router.push('/auso/event')}
              className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-base font-semibold hover:bg-zinc-50"
            >
              Back
            </button>
          </div>
        </Row>
        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
