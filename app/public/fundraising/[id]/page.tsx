// app/public/fundraising/[id]/page.tsx
import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFundraisingById } from '@/lib/mock';

const fmtTHB = (n: number) => n.toLocaleString('en-US');

export default function FundraisingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const item = getFundraisingById(id);
  if (!item) return notFound();

  const dateLabel = (() => {
    if (!item.startDate && !item.endDate) return null;
    const s = item.startDate ? new Date(item.startDate) : null;
    const e = item.endDate ? new Date(item.endDate) : null;
    const fmt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    if (s && e) return `${s.toLocaleDateString(undefined, fmt)} - ${e.toLocaleDateString(undefined, fmt)}`;
    if (s) return s.toLocaleDateString(undefined, fmt);
    return e?.toLocaleDateString(undefined, fmt);
  })();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Top row: poster + info */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full max-w-md rounded-xl object-cover"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-extrabold">{item.title}</h1>

          <div className="mt-4 space-y-1 text-base">
            <div>
              Current Donation:{' '}
              <span className="font-extrabold">{fmtTHB(item.currentDonation ?? 0)} THB</span>
            </div>
            <div>
              Expected Donation:{' '}
              <span className="font-extrabold">{fmtTHB(item.goal)} THB</span>
            </div>
          </div>

          {/* Donate button — Browse style */}
<div className="mt-5">
  <Link
    href={`/public/fundraising/${id}/donate`}
    className="block rounded-md border border-dashed border-zinc-300 bg-zinc-100 p-6
               text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-200
               focus:outline-none focus:ring-2 focus:ring-zinc-200"
  >
    Donate Money
  </Link>
</div>

        </div>
      </div>

      {/* Details block */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 text-sm">
          {item.organizerName && (
            <p>
              <span className="font-semibold">Organized by:</span> {item.organizerName}
            </p>
          )}
          {item.contactLine && (
            <p>
              <span className="font-semibold">Contact Line:</span> {item.contactLine}
            </p>
          )}
          {dateLabel && (
            <p className="mt-4">
              <span className="font-semibold">Time - </span>
              {dateLabel}
            </p>
          )}
          {item.location && (
            <p>
              <span className="font-semibold">Location - </span>
              {item.location}
            </p>
          )}
        </div>

        <div className="md:col-span-2 whitespace-pre-line text-[15px] leading-7 text-zinc-800">
          {item.description}
        </div>
      </div>
    </div>
  );
}