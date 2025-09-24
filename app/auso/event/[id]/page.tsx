'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

type ApiEvent = {
  EventID: number;
  Title: string;
  Description?: string | null;
  Venue?: string | null;
  StartDateTime?: string | null;
  EndDateTime?: string | null;
  Fee?: number | null;
  OrganizerName?: string | null;
  OrganizerLineID?: string | null;
  MaxParticipant?: number | null;
  ParticipantDeadline?: string | null;
  MaxStaff?: number | null;
  MaxStaffDeadline?: string | null;
  ScholarshipHours?: number | null;
  Status?: 'PENDING' | 'LIVE' | 'COMPLETE' | 'REJECTED' | 'DRAFT' | 'UNKNOWN' | string;
};

function toProjectNumber(rawId?: number | string) {
  const digits = String(rawId ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}
function toLocalDT(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AUSOEventEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load the event
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/events/${id}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load event');
        if (!cancelled) setData(json as ApiEvent);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading event');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const startDefault = useMemo(() => toLocalDT(data?.StartDateTime), [data]);
  const endDefault   = useMemo(() => toLocalDT(data?.EndDateTime), [data]);

  async function saveFields(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data) return;

    const fd = new FormData(e.currentTarget);
    const toISO = (name: string) => {
      const v = String(fd.get(name) || '');
      return v ? new Date(v).toISOString() : null;
    };
    const num = (name: string, fallback: number | null) => {
      const raw = fd.get(name);
      if (raw === null || raw === '') return fallback;
      const n = Number(raw);
      return Number.isFinite(n) ? n : fallback;
    };

    const payload: Record<string, any> = {
      Title: String(fd.get('projectName') || data.Title).trim(),
      Description: String(fd.get('description') ?? data.Description ?? '').trim(),
      Venue: String(fd.get('eventVenue') ?? data.Venue ?? '').trim(),
      StartDateTime: toISO('startDate') ?? data.StartDateTime ?? null,
      EndDateTime: toISO('endDate') ?? data.EndDateTime ?? null,
      Fee: num('registrationFee', data.Fee ?? null),
      OrganizerName: String(fd.get('organizerName') ?? data.OrganizerName ?? ''),
      OrganizerLineID: String(fd.get('organizerLineId') ?? data.OrganizerLineID ?? ''),
      MaxParticipant: num('maxParticipants', data.MaxParticipant ?? null),
      ParticipantDeadline: String(fd.get('participantDeadline') || '')
        ? new Date(String(fd.get('participantDeadline'))).toISOString()
        : data.ParticipantDeadline ?? null,
      MaxStaff: num('maxStaff', data.MaxStaff ?? null),
      MaxStaffDeadline: String(fd.get('staffDeadline') || '')
        ? new Date(String(fd.get('staffDeadline'))).toISOString()
        : data.MaxStaffDeadline ?? null,
      ScholarshipHours: num('scholarHours', data.ScholarshipHours ?? null),
      Status: data.Status ?? 'PENDING',
    };

    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to save');
      setData(json as ApiEvent);
      alert('Event saved.');
    } catch (e: any) {
      setErr(e?.message || 'Error while saving');
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: 'LIVE' | 'PENDING' | 'REJECTED' | 'COMPLETE' | 'DRAFT') {
    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to update status');
      setData(json as ApiEvent);

      // After approve/reject, go back to list, preserving current tab if relevant
      const curTab = search.get('fromTab') || (status === 'LIVE' ? 'APPROVED' : 'PENDING');
      router.push(`/auso/event?tab=${curTab}`);
    } catch (e: any) {
      setErr(e?.message || 'Error while updating status');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">Event not found.</div>;

  const paidDefault: 'paid' | 'free' = (data.Fee ?? 0) > 0 ? 'paid' : 'free';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Events</h1>

      <form onSubmit={saveFields} className="mt-4 space-y-4">
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Project Number">
          <div className="py-2 font-mono">{toProjectNumber(data.EventID)}</div>
        </Row>

        <Field label="Project Name" name="projectName" defaultValue={data.Title} />
        <Field label="Organizer Name" name="organizerName" defaultValue={data.OrganizerName ?? ''} />
        <Field label="Organizer LineID" name="organizerLineId" defaultValue={data.OrganizerLineID ?? ''} />
        <Field label="Event Venue" name="eventVenue" defaultValue={data.Venue ?? ''} />

        <Row label="Event Date & Time">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="startDate"
              type="datetime-local"
              defaultValue={startDefault}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
            <input
              name="endDate"
              type="datetime-local"
              defaultValue={endDefault}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </div>
        </Row>

        <Field
          label="Maximum Participant No."
          name="maxParticipants"
          type="number"
          min={0}
          defaultValue={data.MaxParticipant ?? 0}
        />

        <Row label="Deadline for Participant">
          <input
            name="participantDeadline"
            type="date"
            defaultValue={data.ParticipantDeadline ? data.ParticipantDeadline.slice(0, 10) : ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Field
          label="Maximum Staff No."
          name="maxStaff"
          type="number"
          min={0}
          defaultValue={data.MaxStaff ?? 0}
        />
        <Row label="Deadline for Staff">
          <input
            name="staffDeadline"
            type="date"
            defaultValue={data.MaxStaffDeadline ? data.MaxStaffDeadline.slice(0, 10) : ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Field
          label="Scholar Hours for Staff"
          name="scholarHours"
          type="number"
          min={0}
          defaultValue={data.ScholarshipHours ?? 0}
        />

        <Row label="Paid or free">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="paidFree" defaultChecked={paidDefault === 'paid'} />
              <span>Paid</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="paidFree" defaultChecked={paidDefault === 'free'} />
              <span>Free</span>
            </label>
          </div>
        </Row>

        <Field
          label="Registration fees"
          name="registrationFee"
          type="number"
          min={0}
          defaultValue={data.Fee ?? 0}
        />

        <Row label="Project Description">
          <textarea
            name="description"
            defaultValue={data.Description ?? ''}
            rows={6}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Status">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStatus('LIVE')}
              disabled={saving}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              Approve (Live)
            </button>
            <button
              type="button"
              onClick={() => setStatus('PENDING')}
              disabled={saving}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            >
              Move to Pending
            </button>
            <button
              type="button"
              onClick={() => setStatus('REJECTED')}
              disabled={saving}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => setStatus('COMPLETE')}
              disabled={saving}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            >
              Mark Complete
            </button>
          </div>
        </Row>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={saving}
            className="ml-auto rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* UI helpers */
function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Field({
  label,
  name,
  type = 'text',
  min,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  min?: number;
  defaultValue?: string | number;
}) {
  return (
    <Row label={label}>
      <input
        name={name}
        type={type}
        min={min}
        defaultValue={defaultValue as any}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </Row>
  );
}
