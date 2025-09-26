// app/public/fundraising/[id]/page.tsx
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';

type Item = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  goal: number | null;
  currentDonation: number | null;
  organizerName?: string | null;
  contactLine?: string | null;
  location?: string | null;
  status: string;
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  return 'http://localhost:3000';
}

const fmtTHB = (n: number) => n.toLocaleString('en-US');

export default async function FundraisingDetail(
  props: { params: Promise<{ id: string }> } // Next 15: params is a Promise
) {
  noStore();
  const { id } = await props.params;

  const res = await fetch(`${getBaseUrl()}/api/fundraising/${id}`, {
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!res.ok) return notFound();

  const item = (await res.json()) as Item;

  const dates: string | null = null; // (you don't have start/end in DB now)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="w-full max-w-md rounded-xl object-cover" />
          ) : (
            <div className="h-64 w-full rounded-xl bg-zinc-100" />
          )}
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-extrabold">{item.title}</h1>

          <div className="mt-4 space-y-1 text-base">
            <div>
              Current Donation:{' '}
              <span className="font-extrabold">{fmtTHB(item.currentDonation ?? 0)} THB</span>
            </div>
            {item.goal != null && (
              <div>
                Expected Donation:{' '}
                <span className="font-extrabold">{fmtTHB(item.goal)} THB</span>
              </div>
            )}
          </div>

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
          {dates && (
            <p className="mt-4">
              <span className="font-semibold">Time - </span>
              {dates}
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
