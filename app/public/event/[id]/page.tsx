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

  MaxStaff?: number | null;
  MaxParticipant?: number | null;

  ScholarshipHours?: number | null;

  // optional arrays for gallery
  Photos?: string[] | null;
  Gallery?: string[] | null;
  PostURLs?: Array<string | { PostURL?: string | null }> | null;

  // loose variants
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
  maxstaff?: number | null | string;
  maxparticipant?: number | null | string;
  scholarshiphours?: number | null | string;
};

type RegItem = { studentId: string; name: string; phone: string; attended?: boolean };
type ApiRegs = { staff: RegItem[]; participants: RegItem[] };

function parseNum(n: unknown, fallback = 0) {
  const v = typeof n === 'string' ? Number(n) : (n as number | null);
  return Number.isFinite(v as number) ? Number(v) : fallback;
}

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

function uniqNonEmpty(arr: (string | null | undefined)[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of arr) {
    const s = String(u ?? '').trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  noStore();

  const { id } = await params;
  const base = getBaseUrl();

  // Event
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

  // Gallery from optional fields
  const galleryFromArrays = uniqNonEmpty([
    ...(Array.isArray(raw?.Photos) ? raw!.Photos! : []),
    ...(Array.isArray(raw?.Gallery) ? raw!.Gallery! : []),
    ...(Array.isArray(raw?.PostURLs)
      ? raw!.PostURLs!.map((x) => (typeof x === 'string' ? x : (x?.PostURL ?? '')))
      : []),
  ]);

  // Gallery from endpoint
  let galleryFromEndpoint: string[] = [];
  try {
    const gRes = await fetch(`${base}/api/events/${id}/photos`, { cache: 'no-store' });
    if (gRes.ok) {
      const t = await gRes.text();
      if (t) {
        const j = JSON.parse(t) as { items?: string[] } | string[];
        const items = Array.isArray(j) ? j : Array.isArray(j.items) ? j.items : [];
        galleryFromEndpoint = uniqNonEmpty(items);
      }
    }
  } catch { /* ignore */ }

  const gallery = uniqNonEmpty([poster, ...galleryFromArrays, ...galleryFromEndpoint]);

  // Normalize numbers (NO null => we default to 0 so no more "Unlimited")
  const maxStaff = parseNum(raw.MaxStaff ?? raw.maxstaff, 0);
  const maxParticipants = parseNum(raw.MaxParticipant ?? raw.maxparticipant, 0);
  const scholarshipHours = parseNum(raw.ScholarshipHours ?? raw.scholarshiphours, 0);

  const ev = {
    id: raw.EventID ?? raw.id ?? null,
    title: (raw.Title ?? raw.title ?? 'Untitled Event') || 'Untitled Event',
    description: raw.Description ?? raw.description ?? '',
    imageUrl: poster,
    start: raw.StartDateTime ?? raw.startDate ?? null,
    end: raw.EndDateTime ?? raw.endDate ?? null,
    fee: parseNum(raw.Fee, 0),
    venue: raw.Venue ?? raw.venue ?? null,
    maxStaff,
    maxParticipants,
    scholarshipHours,
    gallery,
  };

  if (!ev.id) return notFound();
  const eventId = String(ev.id);

  // Registrations
  let regs: ApiRegs = { staff: [], participants: [] };
  try {
    const r = await fetch(`${base}/api/events/${eventId}/registrations`, { cache: 'no-store' });
    const t = await r.text();
    if (r.ok && t) {
      const j = JSON.parse(t);
      if (Array.isArray(j?.staff) && Array.isArray(j?.participants)) regs = j as ApiRegs;
    }
  } catch { /* ignore */ }

  const registeredStaff = regs.staff.length;
  const registeredParticipants = regs.participants.length;
  const openStaffSlots = Math.max(0, ev.maxStaff - registeredStaff);
  const openParticipantSlots = Math.max(0, ev.maxParticipants - registeredParticipants);

  const dateText = formatRange(ev.start, ev.end);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
      {/* Poster first (like fundraising) */}
      {ev.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ev.imageUrl}
          alt={ev.title}
          loading="lazy"
          className="mx-auto w-full max-w-4xl rounded-xl object-cover"
        />
      )}

      {/* Title / Meta */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-1">
          <h1 className="text-3xl font-extrabold">{ev.title}</h1>
          {dateText && <p className="text-sm text-zinc-600">{dateText}</p>}
          {ev.venue && <p className="text-sm text-zinc-600">Venue: {ev.venue}</p>}
          {ev.fee > 0 && (
            <p className="text-sm text-zinc-600">Registration Fee: {ev.fee.toLocaleString()} THB</p>
          )}
          {ev.scholarshipHours > 0 && (
            <p className="text-sm font-semibold text-zinc-800">
              Scholarship hours – {ev.scholarshipHours} {ev.scholarshipHours === 1 ? 'hour' : 'hours'}
            </p>
          )}
        </div>

        {/* Register + counts card */}
        <div className="md:col-span-1">
          <div className="rounded-lg border border-zinc-200 p-4">
            <RegisterButtons
              eventId={eventId}
              openStaff={openStaffSlots}
              openParticipants={openParticipantSlots}
            />
            <div className="mt-4 text-sm font-semibold">
              <div>Registered Staff: {registeredStaff}</div>
              <div>Open Staff Slot: {openStaffSlots}</div>
              <div className="mt-4">Registered Participant: {registeredParticipants}</div>
              <div>Open Participant Slot: {openParticipantSlots}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {ev.description && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 whitespace-pre-line text-[15px] leading-7 text-zinc-800">
            {ev.description}
          </div>
          <div className="md:col-span-1" />
        </div>
      )}

      {/* Gallery */}
      {ev.gallery.length > (ev.imageUrl ? 1 : 0) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Photos</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {ev.gallery
              .filter((u, idx) => !(idx === 0 && u === ev.imageUrl))
              .map((url, i) => (
                <div key={`${url}-${i}`} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    loading="lazy"
                    className="aspect-[16/10] h-full w-full object-cover"
                  />
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
