// app/public/event/[id]/page.tsx
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import RegisterButtons from '@/components/events/RegisterButtons';
import { getBaseUrl } from '@/lib/baseUrl';

type ApiEvent = {
  EventID?: string | number | null;
  Title?: string | null;
  Description?: string | null;
  PosterURL?: string | null;
  PhotoURL?: string | null;
  StartDateTime?: string | null;
  EndDateTime?: string | null;
  Fee?: number | null;
  Venue?: string | null;

  // Capacity from SAU
  MaxStaff?: number | null;
  MaxParticipant?: number | null;

  // Extras we want to show
  ScholarshipHours?: number | null;
  OrganizerLineID?: string | null;
  LineGpURL?: string | null;
  LineGpQRCode?: string | null;

  // loose variants some routes might return
  id?: string | number | null;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  venue?: string | null;
  posterurl?: string | null;
  photourl?: string | null;
  photo_url?: string | null;

  maxstaff?: number | null;
  maxparticipant?: number | null;
  scholarshiphours?: number | null;
  organizerlineid?: string | null;
  linegpurl?: string | null;
  linegpqrcode?: string | null;
};

type RegItem = { studentId: string; name: string; phone: string; attended?: boolean };
type ApiRegs = { staff: RegItem[]; participants: RegItem[] };

function formatRange(startISO?: string | null, endISO?: string | null) {
  if (!startISO) return '';
  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : s;
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '';
  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return sameDay
    ? s.toLocaleDateString(undefined, opts)
    : `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

export default async function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();

  const { id } = await params;
  const base = getBaseUrl();

  // 1) Fetch event
  const evRes = await fetch(`${base}/api/events/${id}`, { cache: 'no-store' }).catch(() => null);
  if (!evRes || !evRes.ok) return notFound();
  const evText = await evRes.text();
  const raw: ApiEvent | null = evText ? JSON.parse(evText) : null;
  if (!raw) return notFound();

  const poster =
    raw.PosterURL ??
    raw.PhotoURL ??
    raw.imageUrl ??
    raw.posterurl ??
    raw.photourl ??
    raw.photo_url ??
    null;

  const ev = {
    id: raw.EventID ?? raw.id ?? null,
    title: (raw.Title ?? raw.title ?? 'Untitled Event') || 'Untitled Event',
    description: raw.Description ?? raw.description ?? '',
    imageUrl: poster,
    start: raw.StartDateTime ?? raw.startDate ?? null,
    end: raw.EndDateTime ?? raw.endDate ?? null,
    fee: raw.Fee ?? null,
    venue: raw.Venue ?? raw.venue ?? null,
    maxStaff:
      raw.MaxStaff ?? (typeof raw.maxstaff === 'number' ? raw.maxstaff : null),
    maxParticipants:
      raw.MaxParticipant ??
      (typeof raw.maxparticipant === 'number' ? raw.maxparticipant : null),
    scholarshipHours:
      raw.ScholarshipHours ??
      (typeof raw.scholarshiphours === 'number' ? raw.scholarshiphours : null),
    organizerLineId:
      raw.OrganizerLineID ??
      (typeof raw.organizerlineid === 'string' ? raw.organizerlineid : null),
    lineGroupUrl:
      raw.LineGpURL ??
      (typeof raw.linegpurl === 'string' ? raw.linegpurl : null),
    lineGroupQr:
      raw.LineGpQRCode ??
      (typeof raw.linegpqrcode === 'string' ? raw.linegpqrcode : null),
  };

  if (!ev.id) return notFound();
  const eventId = String(ev.id);

  // 2) Fetch registrations
  let regs: ApiRegs = { staff: [], participants: [] };
  try {
    const r = await fetch(`${base}/api/events/${eventId}/registrations`, { cache: 'no-store' });
    const t = await r.text();
    if (r.ok && t) {
      const j = JSON.parse(t);
      if (Array.isArray(j?.staff) && Array.isArray(j?.participants)) regs = j as ApiRegs;
    }
  } catch {
    // ignore; show zeros
  }

  // 3) Counts & open slots (null => Unlimited, 0 => closed)
  const registeredStaff = regs.staff.length;
  const registeredParticipants = regs.participants.length;

  const openStaffSlots =
    ev.maxStaff == null ? null : Math.max(0, Number(ev.maxStaff) - registeredStaff);
  const openParticipantSlots =
    ev.maxParticipants == null ? null : Math.max(0, Number(ev.maxParticipants) - registeredParticipants);

  const dateText = formatRange(ev.start, ev.end);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {ev.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ev.imageUrl}
              alt={ev.title}
              loading="lazy"
              className="w-full max-w-2xl rounded-xl object-cover"
            />
          )}
        </div>

        <div className="md:col-span-1">
          <h1 className="text-3xl font-extrabold">{ev.title}</h1>
          {dateText && <p className="mt-1 text-sm text-zinc-600">{dateText}</p>}
          {ev.venue && <p className="mt-1 text-sm text-zinc-600">Venue: {ev.venue}</p>}
          {ev.fee != null && (
            <p className="mt-1 text-sm text-zinc-600">
              Registration Fee: {Number(ev.fee).toLocaleString()} THB
            </p>
          )}
          {typeof ev.scholarshipHours === 'number' && ev.scholarshipHours > 0 && (
            <p className="mt-1 text-sm font-semibold text-zinc-800">
              Scholarship hours – {ev.scholarshipHours} {ev.scholarshipHours === 1 ? 'hour' : 'hours'}
            </p>
          )}
          {ev.organizerLineId && (
            <p className="mt-1 text-sm text-zinc-700">
              Organizer LINE ID: <span className="font-medium">{ev.organizerLineId}</span>
            </p>
          )}
          {ev.lineGroupUrl && (
            <p className="mt-1 text-sm">
              LINE Group:{' '}
              <a
                href={ev.lineGroupUrl}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ev.lineGroupUrl}
              </a>
            </p>
          )}

          {ev.lineGroupQr && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ev.lineGroupQr}
                alt="LINE group QR code"
                className="h-40 w-40 rounded-md border object-contain"
              />
            </div>
          )}

          <div className="mt-5 text-base font-semibold">
            <div>Registered Staff: {registeredStaff}</div>
            <div>Open Staff Slot: {openStaffSlots == null ? 'Unlimited' : openStaffSlots}</div>

            <div className="mt-4">Registered Participant: {registeredParticipants}</div>
            <div>Open Participant Slot: {openParticipantSlots == null ? 'Unlimited' : openParticipantSlots}</div>
          </div>

          <div className="mt-5">
            <RegisterButtons
              eventId={eventId}
              openStaff={openStaffSlots}
              openParticipants={openParticipantSlots}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {ev.description && (
            <div className="whitespace-pre-line text-[15px] leading-7 text-zinc-800">
              {ev.description}
            </div>
          )}
        </div>
        <div className="md:col-span-1" />
      </div>
    </div>
  );
}
