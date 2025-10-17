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
  Status?: string;
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

function toLocalDT(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toProjectNumber(rawId?: number | string | null) {
  const digits = String(rawId ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}
function statusLabel(s: string) {
  const v = String(s || '').toUpperCase();
  if (v === 'PENDING') return 'PENDING';
  if (v === 'APPROVED') return 'APPROVED';
  if (v === 'LIVE') return 'LIVE';
  if (v === 'COMPLETE') return 'COMPLETE';
  if (v === 'REJECTED') return 'REJECTED';
  if (v === 'DRAFT') return 'DRAFT';
  return 'UNKNOWN';
}

export default function SAUEventEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState<UIEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // gallery state
  const [gallery, setGallery] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  // PromptPay QR upload
  const [qrUploading, setQrUploading] = useState(false);
  const [qrErr, setQrErr] = useState<string | null>(null);

  async function loadGallery(eventId: string) {
    try {
      const r = await fetch(`/api/events/${eventId}/photos`, { cache: 'no-store' });
      const t = await r.text();
      if (!r.ok || !t) return;
      const j = JSON.parse(t);
      if (Array.isArray(j?.items)) setGallery(j.items);
    } catch {}
  }

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

        if (!cancelled) {
          setData(ui);
          loadGallery(String(ui.id));
        }
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
    const nextEnd = toISOOrNull(fd.get('endDate')) ?? data.end ?? null;
    if (nextStart && nextEnd && new Date(nextEnd) < new Date(nextStart)) {
      setErr('End date/time must be after start date/time.');
      return;
    }

    const scholarshipHoursRaw = String(fd.get('scholarshipHours') ?? '').trim();
    const scholarshipHours =
      scholarshipHoursRaw === '' ? null : (Number.isNaN(Number(scholarshipHoursRaw)) ? null : Number(scholarshipHoursRaw));

    const feeRaw = String(fd.get('fee') ?? '').trim();
    const fee = feeRaw === '' ? null : Number(feeRaw);
    const isPaid = typeof fee === 'number' && fee > 0;

    const bankName = String(fd.get('bankName') ?? '').trim() || null;
    const bankAccountNo = String(fd.get('bankAccountNo') ?? '').trim() || null;
    const bankAccountName = String(fd.get('bankAccountName') ?? '').trim() || null;
    const promptPayQr = String(fd.get('promptPayQr') ?? '').trim() || data.promptPayQr || null;

    if (isPaid) {
      if (!bankAccountNo && !promptPayQr) {
        setErr('For paid events, fill Bank Account No. OR provide a PromptPay QR.');
        return;
      }
      if (bankAccountNo && !bankAccountName) {
        setErr('Please provide Bank Account Name when Account No. is filled.');
        return;
      }
    }

    const payload: Record<string, any> = {
      Title: String(fd.get('projectName') || data.title),
      Description: String(fd.get('description') ?? data.description ?? ''),
      Location: String(fd.get('eventVenue') ?? data.location ?? ''),
      StartDate: nextStart,
      EndDate: nextEnd,
      Status: data.status ?? 'PENDING', // SAU can't change this directly
      PhotoURL: data.photoUrl ?? null,
      ScholarshipHours: scholarshipHours,
      OrganizerName: String(fd.get('organizerName') ?? '').trim() || null,
      OrganizerLineID: String(fd.get('organizerLineId') ?? data.organizerLineId ?? '').trim() || null,
      LineGpURL: String(fd.get('lineGroupUrl') ?? data.lineGroupUrl ?? '').trim() || null,
      LineGpQRCode: String(fd.get('lineGroupQr') ?? data.lineGroupQr ?? '').trim() || null,
      Fee: fee,
      BankName: bankName,
      BankAccountNo: bankAccountNo,
      BankAccountName: bankAccountName,
      PromptPayQR: promptPayQr,
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
      setData((prev) => ({
        ...(prev as UIEvent),
        id: String(updated.EventID ?? (prev?.id ?? '')),
        title: (updated.Title ?? prev?.title ?? 'Untitled Event') || 'Untitled Event',
        description: updated.Description ?? prev?.description ?? '',
        photoUrl: updated.PhotoURL ?? (updated as any).PosterURL ?? prev?.photoUrl ?? null,
        location: updated.Location ?? (updated as any).Venue ?? prev?.location ?? null,
        start: updated.StartDate ?? updated.StartDateTime ?? prev?.start ?? null,
        end: updated.EndDate ?? updated.EndDateTime ?? prev?.end ?? null,
        status: String(updated.Status ?? prev?.status ?? 'PENDING').toUpperCase(),
        scholarshipHours:
          typeof updated.ScholarshipHours === 'number' ? updated.ScholarshipHours : prev?.scholarshipHours ?? null,
        organizerLineId: updated.OrganizerLineID ?? prev?.organizerLineId ?? null,
        lineGroupUrl: updated.LineGpURL ?? prev?.lineGroupUrl ?? null,
        lineGroupQr: updated.LineGpQRCode ?? prev?.lineGroupQr ?? null,
        fee: typeof updated.Fee === 'number' ? updated.Fee : prev?.fee ?? null,
        bankName: updated.BankName ?? prev?.bankName ?? null,
        bankAccountNo: updated.BankAccountNo ?? prev?.bankAccountNo ?? null,
        bankAccountName: updated.BankAccountName ?? prev?.bankAccountName ?? null,
        promptPayQr: updated.PromptPayQR ?? prev?.promptPayQr ?? null,
      }));
      alert('Event saved.');
    } catch (e: any) {
      setErr(e?.message || 'Error while saving');
    } finally {
      setSaving(false);
    }
  }

  // SAU can only mark COMPLETE when already APPROVED
  async function markComplete() {
    if (!data) return;
    if (data.status !== 'APPROVED') {
      setErr('Only APPROVED events can be marked COMPLETE.');
      return;
    }
    if (!confirm('Mark this event as COMPLETE?')) return;

    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/events/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'COMPLETE' }),
      });
      const txt = await res.text();
      const j = txt ? JSON.parse(txt) : null;
      if (!res.ok || !j) throw new Error(j?.error || 'Failed to update status');

      setData((prev) => (prev ? { ...prev, status: 'COMPLETE' } : prev));
      alert('Marked as COMPLETE.');
    } catch (e: any) {
      setErr(e?.message || 'Error updating status');
    } finally {
      setSaving(false);
    }
  }

  // uploads
  async function onUploadPhotos() {
    if (!data) return;
    if (!photoFiles || !photoFiles.length) {
      setUploadErr('Please select one or more images.');
      return;
    }
    setUploadErr(null);
    try {
      setUploading(true);
      const form = new FormData();
      Array.from(photoFiles).forEach((f) => form.append('files', f));
      const res = await fetch(`/api/events/${data.id}/photos/upload`, { method: 'POST', body: form });
      const txt = await res.text();
      const j = txt ? JSON.parse(txt) : {};
      if (!res.ok) throw new Error(j?.error || 'Upload failed');
      await loadGallery(String(data.id));
      setPhotoFiles(null);
      alert('Photos uploaded.');
    } catch (e: any) {
      setUploadErr(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }
  async function onUploadQR(file: File) {
    if (!data) return;
    try {
      setQrUploading(true);
      setQrErr(null);
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/events/${data.id}/bank/qr/upload`, { method: 'POST', body: form });
      const txt = await res.text();
      const j = txt ? JSON.parse(txt) : {};
      if (!res.ok) throw new Error(j?.error || 'QR upload failed');
      const url = j?.url as string | undefined;
      if (url) setData((prev) => (prev ? { ...prev, promptPayQr: url } : prev));
      alert('PromptPay QR uploaded.');
    } catch (e: any) {
      setQrErr(e?.message || 'Upload failed');
    } finally {
      setQrUploading(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">Event not found.</div>;

  const isPaid = typeof data.fee === 'number' && data.fee > 0;

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

        <Field label="Organizer LINE ID" name="organizerLineId" defaultValue={data.organizerLineId ?? ''} />
        <Field label="LINE Group URL" name="lineGroupUrl" defaultValue={data.lineGroupUrl ?? ''} />
        <Field label="LINE Group QR (image URL)" name="lineGroupQr" defaultValue={data.lineGroupQr ?? ''} />

        <Field
          label="Scholarship Hours"
          name="scholarshipHours"
          type="number"
          min={0}
          defaultValue={data.scholarshipHours ?? ''}
        />
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

        <Row label="Registration Fee (THB, leave blank if free)">
          <input
            name="fee"
            type="number"
            min={0}
            defaultValue={data.fee ?? ''}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setData((d) => (d ? { ...d, fee: v === '' ? null : Number(v) } : d));
            }}
            className="w-56 rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        {isPaid && (
          <div className="rounded-md border border-zinc-200 p-3">
            <div className="mb-2 text-sm font-semibold">Payment Information (required for paid events)</div>
            <Row label="Bank Name">
              <input name="bankName" defaultValue={data.bankName ?? ''} className="w-full rounded-md border border-zinc-300 px-3 py-2" />
            </Row>
            <Row label="Account No.">
              <input
                name="bankAccountNo"
                defaultValue={data.bankAccountNo ?? ''}
                className="w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </Row>
            <Row label="Account Name">
              <input
                name="bankAccountName"
                defaultValue={data.bankAccountName ?? ''}
                className="w-full rounded-md border border-zinc-300 px-3 py-2"
              />
            </Row>

            <Row label="PromptPay QR">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  {data.promptPayQr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.promptPayQr}
                      alt="PromptPay QR"
                      className="h-32 w-32 rounded-md border object-contain"
                    />
                  ) : null}
                  <label className="flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200">
                    <span>＋ Upload QR (.png/.jpg)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.currentTarget.files?.[0];
                        if (f) onUploadQR(f);
                      }}
                    />
                  </label>
                </div>
                <div className="text-xs text-zinc-600">
                  Or paste URL:
                  <input
                    name="promptPayQr"
                    defaultValue={data.promptPayQr ?? ''}
                    className="ml-2 inline-flex w-[70%] rounded-md border border-zinc-300 px-2 py-1"
                  />
                </div>
                {qrErr && <div className="text-sm text-red-600">{qrErr}</div>}
                {qrUploading && <div className="text-sm">Uploading…</div>}
              </div>
            </Row>
          </div>
        )}

        <Row label="Upload Poster">
          <div className="flex items-center gap-4">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photoUrl} alt={data.title} className="h-60 w-44 rounded-md border object-cover" />
            ) : null}
            <label className="flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200">
              <span>＋ Upload .png, .jpg, .jpeg</span>
              <input type="file" accept="image/png,image/jpeg" className="hidden" name="poster" />
            </label>
          </div>
        </Row>

        <Row label="Photos (multiple)">
          <div className="space-y-3">
            <label className="flex h-28 w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200">
              <span>＋ Select images (.png, .jpg, .jpeg)</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                className="hidden"
                onChange={(e) => setPhotoFiles(e.currentTarget.files)}
              />
            </label>

            {photoFiles?.length ? (
              <div className="text-xs text-zinc-600">
                Selected: {Array.from(photoFiles)
                  .map((f) => f.name)
                  .join(', ')}
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onUploadPhotos}
                disabled={uploading || !photoFiles?.length}
                className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-60"
              >
                {uploading ? 'Uploading…' : 'Upload selected photos'}
              </button>
              {uploadErr && <div className="text-red-600 text-sm">{uploadErr}</div>}
            </div>

            {gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((u) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={u} src={u} alt="Event photo" className="h-36 w-full rounded-md border object-cover" />
                ))}
              </div>
            )}
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

        {/* Bottom actions */}
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

          {/* Only when APPROVED */}
          {data.status === 'APPROVED' && (
            <button
              type="button"
              onClick={markComplete}
              disabled={saving}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              Mark as Complete
            </button>
          )}

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
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
        )}
      </form>

      {/* ---- Status pinned at the very bottom ---- */}
      <StatusCard status={data.status} />
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

function StatusCard({ status }: { status: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 p-4">
      <Row label="Status">
        <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-semibold">
          {statusLabel(status)}
        </div>
      </Row>
      <p className="mt-4 text-sm text-zinc-600">No further edits from SAU after approval.</p>
    </div>
  );
}
