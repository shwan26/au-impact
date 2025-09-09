// components/cards/FundraisingCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Fundraising as Base } from '@/types/db';

type FundItem = Base & { imageUrl?: string; currentDonation?: number };

export default function FundraisingCard({ item }: { item: FundItem }) {
  return (
    <Link href={`/public/fundraising/${item.id}`} className="block group">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
        {/* ⇩ Sized wrapper + Image with `fill` satisfies Next's requirement */}
        <div className="relative h-48 w-full">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition group-hover:scale-[1.01]"
              priority={false}
            />
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-extrabold">{item.title}</h3>
          {typeof item.currentDonation === 'number' && (
            <p className="mt-1 text-sm text-zinc-600">
              Raised: {item.currentDonation.toLocaleString('en-US')} THB
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
