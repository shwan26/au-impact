// app/public/event/[id]/page.tsx
import { use } from 'react';
import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/mock';
import RegisterButtons from '@/components/events/RegisterButtons';

type DateRange = { startDate?: string; endDate?: string };
type PriceInfo = { priceType?: 'free' | 'paid' };
type SlotInfo = { openStaffSlots?: number; openParticipantSlots?: number; registeredStaff?: number; registeredParticipants?: number };
type ImageInfo = { imageUrl?: string };

// helper
function formatRange(date: string, range?: DateRange) {
  const s = new Date((range?.startDate ?? date));
  const e = new Date((range?.endDate ?? date));
  const same =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();
  const fmt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return same
    ? s.toLocaleDateString(undefined, fmt)
    : `${s.toLocaleDateString(undefined, fmt)} – ${e.toLocaleDateString(undefined, fmt)}`;
}

export default function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // Next 15: unwrap Promise
  const evBase = getEventById(id);
  if (!evBase) return notFound();

  // Narrow extra optional fields WITHOUT using `any`
  const evDate = evBase as unknown as DateRange;
  const evSlots = evBase as unknown as SlotInfo;
  const evPrice = evBase as unknown as PriceInfo;
  const evImg   = evBase as unknown as ImageInfo;

  const dateText = formatRange(evBase.date, evDate);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top: poster left, info + buttons right */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {evImg.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={evImg.imageUrl}
              alt={evBase.title}
              className="w-full max-w-xl rounded-xl object-cover"
            />
          )}
        </div>

        <div className="md:col-span-1">
          <h1 className="text-3xl font-extrabold">{evBase.title}</h1>
          <p className="mt-1 text-sm text-zinc-600">{dateText}</p>

          <div className="mt-4 text-base font-semibold">
            <div>Registered Staff: {evSlots.registeredStaff ?? 0}</div>
            <div>Open Staff Slot: {evSlots.openStaffSlots ?? 0}</div>

            <div className="mt-4">Registered Participant: {evSlots.registeredParticipants ?? 0}</div>
            <div>Open Participant Slot: {evSlots.openParticipantSlots ?? 0}</div>
          </div>

          <div className="mt-5">
            <RegisterButtons
              eventId={evBase.id}
              openStaff={evSlots.openStaffSlots ?? 0}
              openParticipants={evSlots.openParticipantSlots ?? 0}
            />
          </div>
        </div>
      </div>

      {/* Description / body */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="whitespace-pre-line text-[15px] leading-7 text-zinc-800">
            {evBase.description}
          </div>
        </div>
        <div className="md:col-span-1" />
      </div>
    </div>
  );
}
