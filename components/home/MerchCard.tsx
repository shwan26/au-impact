// components/home/MerchCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function MerchCard({
  href,
  title,
  imageUrl,
}: {
  href: string;
  title: string;
  imageUrl?: string;
}) {
  return (
    <Link href={href} className="block group">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
        <div className="relative w-full aspect-square bg-white">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-400">
              No image
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="line-clamp-2 text-sm font-semibold">{title}</h3>
        </div>
      </div>
    </Link>
  );
}
