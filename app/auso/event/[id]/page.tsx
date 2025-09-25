'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

type ApiEvent = {
  EventID?: string | number | null;
  Title?: string | null;
  Description?: string | null;

  PhotoURL?: string | null;
  PosterURL?: string | null;

  Venue?: string | null;

  StartDate?: string | null;
  EndDate?: string | null;
  StartDateTime?: string | null;
  EndDateTime?: string | null;

  // Counts / capacity
  MaxParticipant?: number | null;
  MaxStaff?: number | null;

  // Extras we may show/edit lightly
  OrganizerName?: string | null;
  OrganizerLineID?: string | null;

  // For fee radio default only
  Fee?: number | null;

  Status?: string | null;
};

function toLocalDT(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
function toProjectNumber(rawId?: number | string | null) {
  const digits = String(rawId ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}

export default function AUSOEventEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ev, setEv] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load event
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(`/api/events/${id}`, { cache: 'no-store' });
        const t = await r.text();
        const j: ApiEvent | null = t ? JSON.parse(t) : null;
        if (!r.ok || !j) throw new Error((j as any)?.error || 'Failed to load event');
        if (!cancelled) setEv(j);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading event');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const startDefault = useMemo(() => toLocalDT(ev?.StartDateTime ?? ev?.StartDate), [ev]);
  const endDefault   = useMemo(() => toLocalDT(ev?.EndDateTime ?? ev?.EndDate),   [ev]);

  const recruitDefault: 'yes' | 'no' = useMemo(() => {
    const maxStaff = ev?.MaxStaff;
    return typeof maxStaff === 'number' && maxStaff > 0 ? 'yes' : 'no';
  }, [ev]);

  const paidDefault: 'paid' | 'free' = useMemo(() => {
    const fee = ev?.Fee ?? null;
    return typeof fee === 'number' && fee > 0 ? 'paid' : 'free';
  }, [ev]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ev) return;

    const fd = new FormData(e.currentTarget);

    function toISOOrNull(v: FormDataEntryValue | null) {
      const s = (v ?? '').toString().trim();
      if (!s) return null;
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }
    function toNumber(v: FormDataEntryValue | null) {
      const s = (v ?? '').toString().trim();
      if (s === '') return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    }

    const startISO = toISOOrNull(fd.get('startDate'));
    const endISO   = toISOOrNull(fd.get('endDate'));
    if (startISO && endISO && new Date(endISO) < new Date(startISO)) {
      setErr('End date/time must be after start date/time.');
      return;
    }

    const payload: Record<string, any> = {
      Title: String(fd.get('projectName') || ev.Title || 'Untitled'),
      Description: String(fd.get('description') || ev.Description || ''),
      Location: String(fd.get('eventVenue') || ev.Venue || ''),
      StartDate: startISO ?? ev.StartDate ?? ev.StartDateTime ?? null,
      EndDate: endISO ?? ev.EndDate ?? ev.EndDateTime ?? null,
      OrganizerName: String(fd.get('organizerName') || ev.OrganizerName || '').trim() || null,
      OrganizerLineID: String(fd.get('organizerLineId') || ev.OrganizerLineID || '').trim() || null,

      // Capacities here are advisory (AUSO may tweak); backend will store them if supported
      MaxParticipant: toNumber(fd.get('maxParticipants')),
      MaxStaff: toNumber(fd.get('maxStaff')),

      // Fee (for AUSO we won’t override unless explicitly typed)
      Fee: toNumber(fd.get('registrationFee')),
    };

    try {
      setSaving(true);
      setErr(null);
      const r = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const t = await r.text();
      const j = t ? JSON.parse(t) : null;
      if (!r.ok || !j) throw new Error(j?.error || 'Failed to save');
      setEv(j as ApiEvent);
      alert('Saved.');
    } catch (e: any) {
      setErr(e?.message || 'Error while saving');
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(next: 'APPROVED' | 'REJECTED') {
    try {
      const r = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: next }),
      });
      const t = await r.text();
      const j = t ? JSON.parse(t) : null;
      if (!r.ok || !j) throw new Error(j?.error || 'Failed to update status');
      alert(next === 'APPROVED' ? 'Marked as Approved.' : 'Marked as Not Approved.');
      router.push('/auso/event');
    } catch (e: any) {
      alert(e?.message || 'Failed to update status');
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!ev) return <div className="p-6">Event not found.</div>;

  const poster = ev.PhotoURL ?? ev.PosterURL ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Events</h1>

      <form onSubmit={onSave} className="mt-4 space-y-4" noValidate>
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Project Number">
          <div className="py-2 font-mono">{toProjectNumber(ev.EventID ?? null)}</div>
        </Row>

        <Field label="Project Name" name="projectName" defaultValue={ev.Title ?? 'Untitled Event'} />
        <Field label="Organizer Name" name="organizerName" defaultValue={ev.OrganizerName ?? ''} />
        <Field label="Organizer LineID" name="organizerLineId" defaultValue={ev.OrganizerLineID ?? ''} />
        <Field label="Event Venue" name="eventVenue" defaultValue={ev.Venue ?? ''} />

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
          defaultValue={typeof ev.MaxParticipant === 'number' ? ev.MaxParticipant : 0}
        />
        <Field
          label="Maximum Staff No."
          name="maxStaff"
          type="number"
          min={0}
          defaultValue={typeof ev.MaxStaff === 'number' ? ev.MaxStaff : 0}
        />
        <Field label="Deadline for Participant" name="participantDeadline" type="date" />
        <Field label="Deadline for Staff" name="staffDeadline" type="date" />
        <Field label="Scholar Hours for Staff" name="scholarHours" type="number" defaultValue={5} />

        {/* Paid or Free (display-only default control) */}
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
          defaultValue={typeof ev.Fee === 'number' ? ev.Fee : ''}
        />

        {/* Poster preview + upload label (AUSO won’t upload; this mirrors your layout) */}
        <Row label="Upload Poster">
          <div className="flex items-center gap-4">
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt={ev.Title ?? 'Event poster'}
                className="h-60 w-44 rounded-md border object-cover"
              />
            ) : null}
            <label className="flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200">
              <span>＋ Upload .png, .jpg, .jpeg</span>
              <input type="file" accept="image/png,image/jpeg" className="hidden" name="poster" />
            </label>
          </div>
        </Row>

        <Row label="Project Description">
          <textarea
            name="description"
            defaultValue={ev.Description ?? ''}
            rows={6}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        {/* STATUS row with Approve / Not Approve */}
        <Row label="Status">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStatus('APPROVED')}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setStatus('REJECTED')}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Not Approve
            </button>
          </div>
        </Row>

        {/* Bottom buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/auso/event')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            className="ml-auto rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </form>
    </div>
  );
}

/* helpers */
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
