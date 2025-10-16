import { notFound } from 'next/navigation';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import Image from 'next/image';

type ApiItem = {
  AnnouncementID: number;
  Topic: string;
  Description: string | null;
  PhotoURL: string | null;
  DatePosted: string;
  Status: 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  return 'http://localhost:3000';
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;

  const base = getBaseUrl();
  const res = await fetch(`${base}/api/announcements/${id}`, {
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!res.ok) return notFound();
  const data = (await res.json()) as ApiItem;

  if (!data || data.Status !== 'LIVE') return notFound();

  return (
    <section className="container mx-auto px-4 py-6">
      <Link href="/public/announcements" className="text-sm underline">
        ← Back to Announcements
      </Link>

      <div className="mt-4 grid items-start gap-6 lg:grid-cols-2">
        {data.PhotoURL && (
          <div className="relative w-full overflow-hidden rounded-lg border border-zinc-200">
            <div className="relative aspect-[16/9]">
              <Image
                src={data.PhotoURL}
                alt={data.Topic}
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

        <article>
          <h1 className="text-3xl font-bold">{data.Topic}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date(data.DatePosted).toLocaleString()}
          </p>

          {data.Description && (
            <div className="prose mt-4 max-w-none whitespace-pre-line">{data.Description}</div>
          )}
        </article>
      </div>
    </section>
  );
}
