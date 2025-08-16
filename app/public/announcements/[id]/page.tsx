import { getAnnouncementById } from '@/lib/mock';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/format';
import Link from 'next/link';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; 
  const a = getAnnouncementById(id);
  if (!a || a.status !== 'LIVE') return notFound();

  return (
    <section className="container mx-auto px-4 py-6">
      <Link href="/public/announcements" className="text-sm underline">
        ← Back to Announcements
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        {a.photoUrl && (
          <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl">
            <img
              src={a.photoUrl}
              alt={a.topic}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <article>
          <h1 className="text-3xl font-bold">{a.topic}</h1>
          <p className="text-gray-500 mt-1">{formatDate(a.datePosted)}</p>
          <div className="prose max-w-none mt-4 whitespace-pre-line">
            {a.description}
          </div>
        </article>
      </div>
    </section>
  );
}
