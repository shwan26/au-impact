// app/sau/event/create/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function genProjectNumber() {
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `E${rnd}`;
}
function toISOOrNull(v: FormDataEntryValue | null) {
  const s = (v ?? '').toString().trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
function toNumber(v: FormDataEntryValue | null) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function SAUCreateEventPage() {
  const router = useRouter();

  const [projectNumber, setProjectNumber] = useState<string>('');
  useEffect(() => setProjectNumber(genProjectNumber()), []);

  const [recruitStaff, setRecruitStaff] = useState<'yes' | 'no'>('yes');
  const [paidOrFree, setPaidOrFree] = useState<'paid' | 'free'>('free');
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [showPayment, setShowPayment] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);

    try {
      const fd = new FormData(e.currentTarget);

      const startISO = toISOOrNull(fd.get('startDate'));
      const endISO   = toISOOrNull(fd.get('endDate'));
      if (startISO && endISO && new Date(endISO) < new Date(startISO)) {
        throw new Error('End date/time must be after start date/time.');
      }

      // Paid/Free
      const feeInput = toNumber(fd.get('registrationFee')) ?? 0;
      const fee = paidOrFree === 'free' ? 0 : Math.max(0, feeInput);

      // Staff toggles
      const maxStaff         = (recruitStaff === 'no') ? 0 : (toNumber(fd.get('maxStaff')) ?? 0);
      const staffDeadlineISO = (recruitStaff === 'no') ? null : toISOOrNull(fd.get('staffDeadline'));
      const scholarHours     = (recruitStaff === 'no') ? 0 : (toNumber(fd.get('scholarHours')) ?? 0);

      // Participants
      const maxParticipants        = toNumber(fd.get('maxParticipants')) ?? 0;
      const participantDeadlineISO = toISOOrNull(fd.get('participantDeadline'));

      // Poster upload placeholder
      let photoUrl: string | null = null;
      if (files?.[0]) {
        // TODO: wire poster upload endpoint if you want to store a cover
        photoUrl = null;
      }

      // Separate LINE groups
      const lineGpUrlStaff  = String(fd.get('lineGpUrlStaff') ?? '').trim() || null;
      const lineGpQrStaff   = String(fd.get('lineGpQrStaff') ?? '').trim() || null;
      const lineGpUrlPart   = String(fd.get('lineGpUrlPart') ?? '').trim() || null;
      const lineGpQrPart    = String(fd.get('lineGpQrPart') ?? '').trim() || null;

      // Payment
      const bankName        = String(fd.get('bankName') ?? '').trim() || null;
      const bankAccountNo   = String(fd.get('bankAccountNo') ?? '').trim() || null;
      const bankAccountName = String(fd.get('bankAccountName') ?? '').trim() || null;
      const promptPayQr     = String(fd.get('promptPayQr') ?? '').trim() || null;

      // Build payload
      const payload: Record<string, any> = {
        Title: String(fd.get('projectName') || 'Untitled').trim(),
        Description: String(fd.get('projectDescription') || '').trim(),
        PhotoURL: photoUrl,
        Location: String(fd.get('eventVenue') || '').trim(),
        StartDate: startISO,
        EndDate: endISO,
        Status: 'PENDING',

        // capacities
        MaxParticipant: maxParticipants,
        ParticipantDeadline: participantDeadlineISO,
        MaxStaff: maxStaff,
        MaxStaffDeadline: staffDeadlineISO,

        ScholarshipHours: scholarHours,

        // Organizer basics
        OrganizerName: String(fd.get('organizerName') || '').trim() || null,
        OrganizerLineID: String(fd.get('organizerLineId') || '').trim() || null,

        // Separate LINE
        LineGpURL_Staff: lineGpUrlStaff,
        LineGpQRCode_Staff: lineGpQrStaff,
        LineGpURL_Participant: lineGpUrlPart,
        LineGpQRCode_Participant: lineGpQrPart,

        // Fees & bank
        Fee: fee,
        BankName: fee > 0 ? bankName : null,
        BankAccountNo: fee > 0 ? bankAccountNo : null,
        BankAccountName: fee > 0 ? bankAccountName : null,
        PromptPayQR: fee > 0 ? promptPayQr : null,
      };

      // Minimal validation for paid
      if (fee > 0) {
        if (!payload.BankAccountNo && !payload.PromptPayQR) {
          throw new Error('For paid events, fill Bank Account No. OR provide a PromptPay QR.');
        }
        if (payload.BankAccountNo && !payload.BankAccountName) {
          throw new Error('Please provide Bank Account Name when Account No. is filled.');
        }
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || 'Failed to create event');

      // Back to list
      router.push('/sau/event?submitted=1');
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong');
      setSubmitting(false);
    }
  }

  const staffDisabled = recruitStaff === 'no';
  const feeDisabled   = paidOrFree === 'free';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Create Event</h1>

      {err && (
        <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Project Number">
          <div className="py-2 font-mono">{projectNumber || '—'}</div>
          <input type="hidden" name="projectNumber" value={projectNumber} />
        </Row>

        <Field label="Project Name" name="projectName" required />
        <Field label="Organizer Name" name="organizerName" />
        <Field label="Organizer LineID" name="organizerLineId" />
        <Field label="Event Venue" name="eventVenue" />

        <Row label="Event Date & Time">
          <div className="grid grid-cols-2 gap-3">
            <input name="startDate" type="datetime-local" className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200" />
            <input name="endDate" type="datetime-local" className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200" />
          </div>
        </Row>

        <Field label="Maximum Participant No." name="maxParticipants" type="number" min={0} />
        <Field label="Deadline for Participant" name="participantDeadline" type="date" />

        <Row label="Recruiting staff">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="recruitStaffRadio" checked={recruitStaff === 'yes'} onChange={() => setRecruitStaff('yes')} />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="recruitStaffRadio" checked={recruitStaff === 'no'} onChange={() => setRecruitStaff('no')} />
              <span>No</span>
            </label>
          </div>
        </Row>

        <Row label="Maximum Staff No.">
          <input name="maxStaff" type="number" min={0} disabled={staffDisabled}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${staffDisabled ? 'opacity-50 pointer-events-none' : ''}`} />
        </Row>

        <Row label="Deadline for Staff">
          <input name="staffDeadline" type="date" disabled={staffDisabled}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${staffDisabled ? 'opacity-50 pointer-events-none' : ''}`} />
        </Row>

        <Row label="Scholar Hours for Staff">
          <input name="scholarHours" type="number" min={0} disabled={staffDisabled}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${staffDisabled ? 'opacity-50 pointer-events-none' : ''}`} />
        </Row>

        {/* Separate LINE groups */}
        <div className="rounded-md border border-zinc-200 p-3">
          <div className="mb-2 text-sm font-semibold">LINE Group (separate for Staff & Participants)</div>
          <Row label="Staff LINE Group URL">
            <input name="lineGpUrlStaff" className="w-full rounded-md border border-zinc-300 px-3 py-2" />
          </Row>
          <Row label="Staff LINE QR (image URL)">
            <input name="lineGpQrStaff" className="w-full rounded-md border border-zinc-300 px-3 py-2" />
          </Row>
          <Row label="Participant LINE Group URL">
            <input name="lineGpUrlPart" className="w-full rounded-md border border-zinc-300 px-3 py-2" />
          </Row>
          <Row label="Participant LINE QR (image URL)">
            <input name="lineGpQrPart" className="w-full rounded-md border border-zinc-300 px-3 py-2" />
          </Row>
        </div>

        <Row label="Paid or free">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="paidFree" checked={paidOrFree === 'paid'} onChange={() => { setPaidOrFree('paid'); setShowPayment(true); }} />
              <span>Paid</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="paidFree" checked={paidOrFree === 'free'} onChange={() => { setPaidOrFree('free'); setShowPayment(false); }} />
              <span>Free</span>
            </label>
          </div>
        </Row>

        <Row label="Registration fees">
          <input name="registrationFee" type="number" min={0} disabled={paidOrFree === 'free'}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${paidOrFree === 'free' ? 'opacity-50 pointer-events-none' : ''}`} />
        </Row>

        {/* Collapsible Payment (only for Paid) */}
        {paidOrFree === 'paid' && (
          <div className="rounded-md border border-zinc-200 p-3">
            <button type="button" onClick={() => setShowPayment((v) => !v)} className="text-sm font-semibold">
              {showPayment ? '▼' : '►'} Payment Information
            </button>
            {showPayment && (
              <div className="mt-3 space-y-3">
                <Row label="Bank Name">
                  <input name="bankName" className="w-full rounded-md border border-zinc-300 px-3 py-2" />
                </Row>
                <Row label="Account No.">
                  <input name="bankAccountNo" className="w-full rounded-md border border-zinc-300 px-3 py-2" />
                </Row>
                <Row label="Account Name">
                  <input name="bankAccountName" className="w-full rounded-md border border-zinc-300 px-3 py-2" />
                </Row>
                <Row label="PromptPay QR (image URL)">
                  <input name="promptPayQr" className="w-full rounded-md border border-zinc-300 px-3 py-2" />
                </Row>
              </div>
            )}
          </div>
        )}

        <Row label="Upload Poster">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
            <span className="text-xl">＋</span>
            <span>{files?.[0]?.name ?? 'Upload .png, .jpg, .jpeg (optional)'}</span>
            <input type="file" name="poster" accept="image/png,image/jpeg" onChange={(e) => setFiles(e.currentTarget.files)} className="hidden" />
          </label>
        </Row>

        <Row label="Project Description">
          <textarea name="projectDescription" rows={4} className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200" />
        </Row>

        <div className="pt-2">
          <button type="submit" disabled={!projectNumber || submitting} aria-busy={submitting}
            className="rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* helpers */
function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Field({ label, name, type = 'text', required, min }: { label: string; name: string; type?: string; required?: boolean; min?: number; }) {
  return (
    <Row label={label}>
      <input name={name} type={type} required={required} min={min} className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200" />
    </Row>
  );
}
