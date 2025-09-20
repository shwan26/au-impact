'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type ApiEvent = {
  // API payload (server maps DB -> these keys)
  EventID: number;
  Title: string;
  Description?: string | null;
  Venue?: string | null;
  StartDateTime?: string | null;     // ISO
  EndDateTime?: string | null;       // ISO
  Fee?: number | null;
  OrganizerName?: string | null;
  OrganizerLineID?: string | null;
  MaxParticipant?: number | null;
  ParticipantDeadline?: string | null; // ISO date/datetime
  MaxStaff?: number | null;
  MaxStaffDeadline?: string | null;    // ISO date/datetime
  ScholarshipHours?: number | null;
  Status?: 'PENDING' | 'LIVE' | 'COMPLETE' | string; // if your table has Status
};

function toProjectNumber(rawId?: number | string) {
  const digits = String(rawId ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}

function toLocalDT(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function AUSOEventEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
    return () => {
      cancelled = true;
    };
  }, [id]);

  const startDefault = useMemo(() => toLocalDT(data?.StartDateTime), [data]);
  const endDefault = useMemo(() => toLocalDT(data?.EndDateTime), [data]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data) return;

    const fd = new FormData(e.currentTarget);

    // Build update payload (PascalCase keys expected by your API routes)
    const payload: Record<string, any> = {
      Title: String(fd.get('projectName') || data.Title),
      Description: String(fd.get('description') || data.Description || ''),
      Venue: String(fd.get('eventVenue') || data.Venue || ''),
      StartDateTime: fd.get('startDate') ? new Date(String(fd.get('startDate'))).toISOString() : data.StartDateTime ?? null,
      EndDateTime: fd.get('endDate') ? new Date(String(fd.get('endDate'))).toISOString() : data.EndDateTime ?? null,
      Fee: fd.get('registrationFee') ? Number(fd.get('registrationFee')) : (data.Fee ?? null),
      OrganizerName: String(fd.get('organizerName') || data.OrganizerName || ''),
      OrganizerLineID: String(fd.get('organizerLineId') || data.OrganizerLineID || ''),
      MaxParticipant: fd.get('maxParticipants') ? Number(fd.get('maxParticipants')) : (data.MaxParticipant ?? null),
      ParticipantDeadline: fd.get('participantDeadline')
        ? new Date(String(fd.get('participantDeadline'))).toISOString()
        : data.ParticipantDeadline ?? null,
      MaxStaff: fd.get('maxStaff') ? Number(fd.get('maxStaff')) : (data.MaxStaff ?? null),
      MaxStaffDeadline: fd.get('staffDeadline')
        ? new Date(String(fd.get('staffDeadline'))).toISOString()
        : data.MaxStaffDeadline ?? null,
      ScholarshipHours: fd.get('scholarHours') ? Number(fd.get('scholarHours')) : (data.ScholarshipHours ?? null),
      // Status: keep existing unless you want to change it here
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

  async function onApprove() {
    if (!data) return;
    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // If your Event table doesn't have "Status", this will be ignored by your API (or error).
        body: JSON.stringify({ Status: 'LIVE' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to approve');
      setData(json as ApiEvent);
      alert('Marked as Approved.');
      router.push('/auso/events');
    } catch (e: any) {
      setErr(e?.message || 'Error while approving');
    } finally {
      setSaving(false);
    }
  }

  async function onNotApprove() {
    if (!data) return;
    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Use PENDING to represent "not approved yet". If you have REJECTED, change this.
        body: JSON.stringify({ Status: 'PENDING' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to update status');
      setData(json as ApiEvent);
      alert('Marked as Not Approved.');
      router.push('/auso/events');
    } catch (e: any) {
      setErr(e?.message || 'Error while updating');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">Event not found.</div>;

  // Simple defaults for radio groups
  const paidDefault: 'paid' | 'free' = (data.Fee ?? 0) > 0 ? 'paid' : 'free';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Events</h1>

      <form onSubmit={onSave} className="mt-4 space-y-4">
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

        {/* Recruiting staff */}
        <Row label="Recruiting staff">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="recruitStaff" defaultChecked={(data.MaxStaff ?? 0) > 0} />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="recruitStaff" defaultChecked={(data.MaxStaff ?? 0) === 0} />
              <span>No</span>
            </label>
          </div>
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

        {/* Paid or Free */}
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

        {/* Project Description */}
        <Row label="Project Description">
          <textarea
            name="description"
            defaultValue={data.Description ?? ''}
            rows={6}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        {/* STATUS row with Approve / Not Approve */}
        <Row label="Status">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onApprove}
              disabled={saving}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={onNotApprove}
              disabled={saving}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            >
              Not Approve
            </button>
          </div>
        </Row>

        {/* Bottom buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/auso/events')}
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
