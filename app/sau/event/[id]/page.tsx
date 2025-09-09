'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getEventById } from '@/lib/mock';
import type { Event } from '@/types/db';

function toLocalDT(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  // yyyy-MM-ddTHH:mm
  const pad = (n: number) => String(n).padStart(2, '0');
  const str =
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes());
  return str;
}

function toProjectNumber(e: Event) {
  const digits = String(e.id ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}

export default function SAUEventEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const ev = getEventById(id);
  if (!ev) {
    return <div className="p-6">Event not found.</div>;
  }

  const initialRecruit = (ev.openStaffSlots ?? 0) > 0 ? 'yes' : 'no';
  const initialPaid = ev.priceType === 'paid' ? 'paid' : 'free';

  const [recruitStaff, setRecruitStaff] = useState<'yes' | 'no'>(initialRecruit);
  const [paidOrFree, setPaidOrFree] = useState<'paid' | 'free'>(initialPaid);

  // keep buttons enabled even if we edit nothing
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert('Changes saved (demo only).');
  }

  const staffDisabled = recruitStaff === 'no';
  const feeDisabled = paidOrFree === 'free';

  const startDefault = toLocalDT(ev.startDate ?? ev.date);
  const endDefault = toLocalDT(ev.endDate ?? ev.date);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Events</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Project Number">
          <div className="py-2 font-mono">{toProjectNumber(ev)}</div>
        </Row>

        <Field label="Project Name" name="projectName" defaultValue={ev.title} />
        <Field label="Organizer Name" name="organizerName" defaultValue="" />
        <Field label="Organizer LineID" name="organizerLineId" defaultValue="" />
        <Field label="Event Venue" name="eventVenue" defaultValue="" />

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
          defaultValue={ev.openParticipantSlots ?? 0}
        />
        <Field label="Deadline for Participant" name="participantDeadline" type="date" />

        {/* recruiting staff */}
        <Row label="Recruiting staff">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="recruitStaff"
                checked={recruitStaff === 'yes'}
                onChange={() => setRecruitStaff('yes')}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="recruitStaff"
                checked={recruitStaff === 'no'}
                onChange={() => setRecruitStaff('no')}
              />
              <span>No</span>
            </label>
          </div>
        </Row>

        <Row label="Maximum Staff No.">
          <input
            name="maxStaff"
            type="number"
            min={0}
            defaultValue={ev.openStaffSlots ?? 0}
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

        <Row label="Upload Poster">
          <div className="flex items-center gap-4">
            {ev.imageUrl ? (
              <Image
                src={ev.imageUrl}
                alt={ev.title}
                width={180}
                height={240}
                className="rounded-md border object-cover"
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
            defaultValue={ev.description ?? ''}
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
            href={`/public/event/${ev.id}`}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            View as Participant
          </Link>

          <Link
            href={`/sau/event/${ev.id}/participants`}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Participant/Staff List
          </Link>

          <button
            type="submit"
            className="ml-auto rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

/* tiny helpers */
function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Field({
  label, name, type = 'text', min, defaultValue,
}: {
  label: string; name: string; type?: string; min?: number; defaultValue?: string | number;
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
