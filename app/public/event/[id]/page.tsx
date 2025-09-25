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
  Venue?: string | null;
  Fee?: number | null;

  // Capacities (may be null/undefined)
  MaxStaff?: number | null;
  MaxParticipant?: number | null;

  // Loose variants your API might return
  id?: string | number | null;
  title?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  venue?: string | null;
  photourl?: string | null;
  posterurl?: string | null;
  photo_url?: string | null;
  imageUrl?: string | null;

  maxstaff?: number | null;
  maxparticipant?: number | null;
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

  // 1) Load event
  const evRes = await fetch(`${base}/api/events/${id}`, { cache: 'no-store' }).catch(() => null);
  if (!evRes || !evRes.ok) return notFound();
  const evText = await evRes.text();
  const raw: ApiEvent | null = evText ? JSON.parse(evText) : null;
  if (!raw) return notFound();

  // Normalize event fields
  const imageUrl =
    raw.PosterURL ??
    raw.PhotoURL ??
    raw.imageUrl ??
    raw.posterurl ??
    raw.photourl ??
    raw.photo_url ??
    null;

  const maxStaff =
    typeof raw.MaxStaff === 'number'
      ? raw.MaxStaff
      : typeof raw.maxstaff === 'number'
      ? raw.maxstaff
      : null;

  const maxParticipants =
    typeof raw.MaxParticipant === 'number'
      ? raw.MaxParticipant
      : typeof raw.maxparticipant === 'number'
      ? raw.maxparticipant
      : null;

  const ev = {
    id: raw.EventID ?? raw.id ?? null,
    title: (raw.Title ?? raw.title ?? 'Untitled Event') || 'Untitled Event',
    description: raw.Description ?? raw.description ?? '',
    imageUrl,
    start: raw.StartDateTime ?? raw.startDate ?? null,
    end: raw.EndDateTime ?? raw.endDate ?? null,
    venue: raw.Venue ?? raw.venue ?? null,
    fee:
      typeof raw.Fee === 'number'
        ? raw.Fee
        : raw.Fee == null
        ? null
        : Number(raw.Fee),
    maxStaff,
    maxParticipants,
  };

  if (!ev.id) return notFound();
  const eventId = String(ev.id);

  // 2) Load registrations to calculate counts (no "Unlimited" anymore)
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

  const registeredStaff = regs.staff.length;
  const registeredParticipants = regs.participants.length;

  // If caps are missing/null, treat as 0 (so never shows "Unlimited")
  const openStaffSlots =
    ev.maxStaff == null ? 0 : Math.max(0, Number(ev.maxStaff) - registeredStaff);
  const openParticipantSlots =
    ev.maxParticipants == null
      ? 0
      : Math.max(0, Number(ev.maxParticipants) - registeredParticipants);

  const dateText = formatRange(ev.start, ev.end);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {/* Poster left, info right */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {ev.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ev.imageUrl}
              alt={ev.title}
              loading="lazy"
              className="w-full max-w-xl rounded-xl object-cover"
            />
          )}
        </div>

        <div className="md:col-span-1">
          <h1 className="text-3xl font-extrabold">{ev.title}</h1>
          {dateText && <p className="mt-1 text-sm text-zinc-600">{dateText}</p>}
          {ev.venue && <p className="mt-1 text-sm text-zinc-600">Venue: {ev.venue}</p>}
          {typeof ev.fee === 'number' && (
            <p className="mt-1 text-sm text-zinc-600">
              Registration Fee: {Number(ev.fee).toLocaleString()} THB
            </p>
          )}

          <div className="mt-4 text-base font-semibold">
            <div>Registered Staff: {registeredStaff}</div>
            <div>Open Staff Slot: {openStaffSlots}</div>

            <div className="mt-4">Registered Participant: {registeredParticipants}</div>
            <div>Open Participant Slot: {openParticipantSlots}</div>
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

      {/* Description under the top section */}
      {ev.description && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="whitespace-pre-line text-[15px] leading-7 text-zinc-800">
              {ev.description}
            </div>
          </div>
          <div className="md:col-span-1" />
        </div>
      )}
    </div>
  );
}
