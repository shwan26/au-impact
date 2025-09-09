'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function genProjectNumber() {
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `E${rnd}`;
}

export default function SAUCreateEventPage() {
  const router = useRouter();

  // Generate after mount to avoid hydration mismatch
  const [projectNumber, setProjectNumber] = useState<string>('');
  useEffect(() => {
    setProjectNumber(genProjectNumber());
  }, []);

  const [recruitStaff, setRecruitStaff] = useState<'yes' | 'no'>('yes');
  const [paidOrFree, setPaidOrFree] = useState<'paid' | 'free'>('free');
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const staffDisabled = recruitStaff === 'no';
  const feeDisabled = paidOrFree === 'free';

  // ✅ No network calls — always “complete”
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    // Optional: quick confirmation
    alert('Submitted ✔');

    // Redirect back to the SAU events list with a success flag
    router.push('/sau/event?submitted=1');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Create Event</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        {/* Activity Unit */}
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        {/* Project Number (client generated; read-only) */}
        <Row label="Project Number">
          <div className="py-2 font-mono">{projectNumber || '—'}</div>
          <input type="hidden" name="projectNumber" value={projectNumber} />
        </Row>

        <Field label="Project Name" name="projectName" required />
        <Field label="Organizer Name" name="organizerName" />
        <Field label="Organizer LineID" name="organizerLineId" />
        <Field label="Event Venue" name="eventVenue" />

        {/* Event Date & Time */}
        <Row label="Event Date & Time">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="startDate"
              type="datetime-local"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
            <input
              name="endDate"
              type="datetime-local"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </div>
        </Row>

        <Field label="Maximum Participant No." name="maxParticipants" type="number" min={0} />
        <Field label="Deadline for Participant" name="participantDeadline" type="date" />

        {/* Recruiting staff */}
        <Row label="Recruiting staff">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="recruitStaffRadio"
                checked={recruitStaff === 'yes'}
                onChange={() => setRecruitStaff('yes')}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="recruitStaffRadio"
                checked={recruitStaff === 'no'}
                onChange={() => setRecruitStaff('no')}
              />
              <span>No</span>
            </label>
          </div>
        </Row>

        {/* Staff fields (disabled/greyed when "No") */}
        <Row label="Maximum Staff No.">
          <input
            name="maxStaff"
            type="number"
            min={0}
            disabled={staffDisabled}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${
              staffDisabled ? 'opacity-50 pointer-events-none' : ''
            }`}
          />
        </Row>
        <Row label="Deadline for Staff">
          <input
            name="staffDeadline"
            type="date"
            disabled={staffDisabled}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${
              staffDisabled ? 'opacity-50 pointer-events-none' : ''
            }`}
          />
        </Row>
        <Row label="Scholar Hours for Staff">
          <input
            name="scholarHours"
            type="number"
            min={0}
            disabled={staffDisabled}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${
              staffDisabled ? 'opacity-50 pointer-events-none' : ''
            }`}
          />
        </Row>

        {/* Paid or Free */}
        <Row label="Paid or free">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paidFree"
                checked={paidOrFree === 'paid'}
                onChange={() => setPaidOrFree('paid')}
              />
              <span>Paid</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paidFree"
                checked={paidOrFree === 'free'}
                onChange={() => setPaidOrFree('free')}
              />
              <span>Free</span>
            </label>
          </div>
        </Row>

        {/* Registration fees (disabled when Free) */}
        <Row label="Registration fees">
          <input
            name="registrationFee"
            type="number"
            min={0}
            disabled={feeDisabled}
            className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${
              feeDisabled ? 'opacity-50 pointer-events-none' : ''
            }`}
          />
        </Row>

        {/* Upload Poster */}
        <Row label="Upload Poster">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
            <span className="text-xl">＋</span>
            <span>{files?.[0]?.name ?? 'Upload .png, .jpg, .jpeg (up to 5 photos)'}</span>
            <input
              type="file"
              name="poster"
              accept="image/png,image/jpeg"
              multiple
              onChange={(e) => setFiles(e.currentTarget.files)}
              className="hidden"
            />
          </label>
        </Row>

        <Row label="Project Description">
          <textarea
            name="projectDescription"
            rows={4}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!projectNumber || submitting}
            className="rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- small helpers ---------- */

function Row({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <Row label={label}>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </Row>
  );
}
