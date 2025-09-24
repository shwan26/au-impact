'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

  Status?: 'PENDING' | 'LIVE' | 'COMPLETE' | 'APPROVED' | 'REJECTED' | 'DRAFT' | string;
};

type UIEvent = {
  id: string;
  title: string;
  description: string;
  photoUrl: string | null;
  location: string | null;
  start: string | null; // ISO
  end: string | null;   // ISO
  status: string;
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

export default function SAUEventEditPage() {
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
        const text = await res.text();
        const json: ApiEvent | null = text ? JSON.parse(text) : null;
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
        };

        if (!cancelled) setData(ui);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading event');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const startDefault = useMemo(() => toLocalDT(data?.start), [data]);
  const endDefault = useMemo(() => toLocalDT(data?.end), [data]);

  function toISOOrNull(v: FormDataEntryValue | null) {
    const s = (v ?? '').toString().trim();
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data) return;

    const fd = new FormData(e.currentTarget);

    const nextStart = toISOOrNull(fd.get('startDate')) ?? data.start ?? null;
    const nextEnd   = toISOOrNull(fd.get('endDate')) ?? data.end ?? null;
    if (nextStart && nextEnd && new Date(nextEnd) < new Date(nextStart)) {
      setErr('End date/time must be after start date/time.');
      return;
    }

    const payload: Record<string, any> = {
      Title: String(fd.get('projectName') || data.title),
      Description: String(fd.get('description') ?? data.description ?? ''),
      Location: String(fd.get('eventVenue') ?? data.location ?? ''),
      StartDate: nextStart,
      EndDate: nextEnd,
      Status: data.status ?? 'PENDING',
      PhotoURL: data.photoUrl ?? null,
    };

    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (!res.ok || !json) throw new Error(json?.error || 'Failed to save');

      const updated: ApiEvent = json;
      setData({
        id: String(updated.EventID ?? data.id),
        title: (updated.Title ?? data.title) || 'Untitled Event',
        description: updated.Description ?? data.description,
        photoUrl: updated.PhotoURL ?? (updated as any).PosterURL ?? data.photoUrl,
        location: updated.Location ?? (updated as any).Venue ?? data.location,
        start: updated.StartDate ?? updated.StartDateTime ?? data.start,
        end: updated.EndDate ?? updated.EndDateTime ?? data.end,
        status: String(updated.Status ?? data.status ?? 'PENDING').toUpperCase(),
      });
      alert('Event saved.');
    } catch (e: any) {
      setErr(e?.message || 'Error while saving');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">Event not found.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Events</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Project Number">
          <div className="py-2 font-mono">{toProjectNumber(data.id)}</div>
        </Row>

        <Field label="Project Name" name="projectName" defaultValue={data.title} />
        <Field label="Organizer Name" name="organizerName" defaultValue="" />
        <Field label="Organizer LineID" name="organizerLineId" defaultValue="" />
        <Field label="Event Venue" name="eventVenue" defaultValue={data.location ?? ''} />

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

        <Row label="Upload Poster">
          <div className="flex items-center gap-4">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.photoUrl}
                alt={data.title}
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
            defaultValue={data.description ?? ''}
            rows={6}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        {/* Bottom buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/sau/event')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Back
          </button>

          <Link
            href={`/public/event/${data.id}`}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            View as Participant
          </Link>

          <Link
            href={`/sau/event/${data.id}/participants`}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Participant/Staff List
          </Link>

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
