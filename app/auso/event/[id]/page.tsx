'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getEventById } from '@/lib/mock';
import type { Event } from '@/types/db';

function toLocalDT(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}
function toProjectNumber(e: Event) {
  const digits = String(e.id ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}

export default function AUSOEventEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const ev = getEventById(id);
  if (!ev) return <div className="p-6">Event not found.</div>;

  const recruitDefault: 'yes' | 'no' = (ev.openStaffSlots ?? 0) > 0 ? 'yes' : 'no';
  const paidDefault: 'paid' | 'free' = ev.priceType === 'paid' ? 'paid' : 'free';

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert('Saved (demo).');
  }
  function approve() {
    alert('Marked as Approved (demo).');
    router.push('/auso/event');
  }
  function notApprove() {
    alert('Marked as Not Approved (demo).');
    router.push('/auso/event');
  }

  const startDefault = toLocalDT(ev.startDate ?? ev.date);
  const endDefault = toLocalDT(ev.endDate ?? ev.date);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Events</h1>

      <form onSubmit={onSave} className="mt-4 space-y-4">
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Project Number">
          <div className="py-2 font-mono">{toProjectNumber(ev)}</div>
        </Row>

        <Field label="Project Name" name="projectName" defaultValue={ev.title} />
        <Field label="Organizer Name" name="organizerName" defaultValue="Kritapas Nakin" />
        <Field label="Organizer LineID" name="organizerLineId" defaultValue="@kritapas" />
        <Field label="Event Venue" name="eventVenue" defaultValue="CL 13 floor" />

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

        {/* Recruiting staff */}
        <Row label="Recruiting staff">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="recruitStaff" defaultChecked={recruitDefault === 'yes'} />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="recruitStaff" defaultChecked={recruitDefault === 'no'} />
              <span>No</span>
            </label>
          </div>
        </Row>

        <Field
          label="Maximum Staff No."
          name="maxStaff"
          type="number"
          min={0}
          defaultValue={ev.openStaffSlots ?? 0}
        />
        <Field label="Deadline for Staff" name="staffDeadline" type="date" />
        <Field label="Scholar Hours for Staff" name="scholarHours" type="number" defaultValue={5} />

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

        <Field label="Registration fees" name="registrationFee" type="number" min={0} />

        {/* Poster preview + upload */}
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

        {/* ✅ STATUS row with Approve / Not Approve */}
        <Row label="Status">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={approve}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={notApprove}
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
            className="ml-auto rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
          >
            Save
          </button>
        </div>
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
