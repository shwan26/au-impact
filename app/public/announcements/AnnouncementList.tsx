'use client';

import Link from 'next/link';
import Image from 'next/image';

export type AnnouncementListItem = {
  id: string;
  topic: string;
  description?: string;
  datePosted?: string;
  status?: string;
  photoUrl?: string;
};

export default function AnnouncementList({ items }: { items: AnnouncementListItem[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6 text-zinc-600">
        No announcements found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => (
        <article key={a.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {/* Image */}
          <div className="relative aspect-[16/9] bg-zinc-100">
            {a.photoUrl ? (
              <Image
                src={a.photoUrl}
                alt={a.topic}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>

          {/* Body */}
          <div className="p-4">
            <h3 className="line-clamp-2 text-base font-semibold">
              <Link href={`/public/announcements/${a.id}`} className="hover:underline">
                {a.topic}
              </Link>
            </h3>

            {a.datePosted && <p className="mt-1 text-xs text-zinc-500">{a.datePosted}</p>}

            {a.description && (
              <p className="mt-2 line-clamp-3 text-sm text-zinc-700">{a.description}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
