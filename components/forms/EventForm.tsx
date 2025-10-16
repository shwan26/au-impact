'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = { redirectTo?: string };

export default function EventForm({ redirectTo = '/sau/events' }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const start = fd.get('StartDateTime') as string | null;
    const end = fd.get('EndDateTime') as string | null;

    if (!fd.get('Title')) { setErr('Title is required.'); return; }
    if (!start || !end) { setErr('Start and End date/time are required.'); return; }

    const payload = {
      Title: String(fd.get('Title') || ''),
      Description: String(fd.get('Description') || ''),
      Venue: String(fd.get('Venue') || ''),
      StartDateTime: new Date(String(start)).toISOString(),
      EndDateTime: new Date(String(end)).toISOString(),
      Fee: fd.get('Fee') ? Number(fd.get('Fee')) : 0,

      OrganizerName: String(fd.get('OrganizerName') || ''),
      OrganizerLineID: String(fd.get('OrganizerLineID') || ''),

      MaxParticipant: fd.get('MaxParticipant') ? Number(fd.get('MaxParticipant')) : null,
      ParticipantDeadline: fd.get('ParticipantDeadline')
        ? new Date(String(fd.get('ParticipantDeadline'))).toISOString()
        : null,
      MaxStaff: fd.get('MaxStaff') ? Number(fd.get('MaxStaff')) : null,
      MaxStaffDeadline: fd.get('MaxStaffDeadline')
        ? new Date(String(fd.get('MaxStaffDeadline'))).toISOString()
        : null,
      ScholarshipHours: fd.get('ScholarshipHours') ? Number(fd.get('ScholarshipHours')) : null,

      // ✅ NEW: send all payment/contact fields
      BankName: String(fd.get('BankName') || ''),
      BankAccountNo: String(fd.get('BankAccountNo') || ''),
      BankAccountName: String(fd.get('BankAccountName') || ''),
      PromptPayQR: String(fd.get('PromptPayQR') || ''),

      LineGpURL: String(fd.get('LineGpURL') || ''),
      LineGpQRCode: String(fd.get('LineGpQRCode') || ''),

      // ✅ already supported by your API/DB
      PosterURL: fd.get('PosterURL') ? String(fd.get('PosterURL')) : null,

      Status: 'PENDING', // SAU submits as PENDING
    };

    try {
      setSaving(true);
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to create event');

      router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {err && <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      <Field label="Project Name (Title)"><input name="Title" className="input" placeholder="e.g., Welcome Fair" /></Field>
      <Field label="Organizer Name"><input name="OrganizerName" className="input" placeholder="Your name" /></Field>
      <Field label="Organizer LineID"><input name="OrganizerLineID" className="input" placeholder="@yourlineid" /></Field>
      <Field label="Event Venue"><input name="Venue" className="input" placeholder="CL 13th floor" /></Field>

      <Field label="Start Date & Time"><input name="StartDateTime" type="datetime-local" className="input" /></Field>
      <Field label="End Date & Time"><input name="EndDateTime" type="datetime-local" className="input" /></Field>

      <Field label="Maximum Participant No."><input name="MaxParticipant" type="number" min={0} className="input" /></Field>
      <Field label="Deadline for Participant"><input name="ParticipantDeadline" type="date" className="input" /></Field>
      <Field label="Maximum Staff No."><input name="MaxStaff" type="number" min={0} className="input" /></Field>
      <Field label="Deadline for Staff"><input name="MaxStaffDeadline" type="date" className="input" /></Field>
      <Field label="Scholar Hours for Staff"><input name="ScholarshipHours" type="number" min={0} className="input" /></Field>

      <Field label="Registration Fee (THB)"><input name="Fee" type="number" min={0} className="input" placeholder="0" /></Field>

      {/* ✅ NEW: Payment/Bank info for paid events */}
      <Field label="Bank Name (optional)"><input name="BankName" className="input" placeholder="e.g., SCB" /></Field>
      <Field label="Bank Account No. (optional)"><input name="BankAccountNo" className="input" placeholder="xxx-x-xxxxx-x" /></Field>
      <Field label="Bank Account Name (optional)"><input name="BankAccountName" className="input" placeholder="Account holder" /></Field>
      <Field label="PromptPay QR URL (optional)"><input name="PromptPayQR" type="url" className="input" placeholder="https://…" /></Field>

      {/* ✅ NEW: Line group info */}
      <Field label="Line Group URL (optional)"><input name="LineGpURL" type="url" className="input" placeholder="https://line.me/…" /></Field>
      <Field label="Line Group QR URL (optional)"><input name="LineGpQRCode" type="url" className="input" placeholder="https://…" /></Field>

      <Field label="Poster URL (optional)"><input name="PosterURL" type="url" className="input" placeholder="https://…" /></Field>

      <Field label="Project Description">
        <textarea name="Description" rows={5} className="input" placeholder="Describe your event…" />
      </Field>

      <div className="pt-2">
        <button type="submit" disabled={saving}
          className="rounded-md bg-zinc-900 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60">
          {saving ? 'Creating…' : 'Create Event'}
        </button>
      </div>

      <style jsx>{`
        .input { width: 100%; border-radius: 0.375rem; border: 1px solid rgb(212 212 216); padding: 0.5rem 0.75rem; outline: none; }
        .input:focus { box-shadow: 0 0 0 2px rgb(244 244 245); }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-2">
      <div className="text-sm font-medium text-zinc-700">{label}</div>
      {children}
    </div>
  );
}
