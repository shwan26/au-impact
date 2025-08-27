// components/cards/FundraisingCard.tsx
'use client';

import Link from 'next/link';
import type { Fundraising } from '@/types/db';
import Image from 'next/image';

const fmtTHB = (n: number) => n.toLocaleString('en-US');

export default function FundraisingCard({ item }: { item: Fundraising }) {
  return (
    <Link href={`/public/fundraising/${item.id}`} className="block group">
      <div className="max-w-3xl">
        {item.imageUrl && (
        <div className="relative mb-4 h-56 w-full overflow-hidden rounded-lg md:h-64">
          <Image
            src={item.imageUrl}
            alt={item.title}
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
            loading="lazy"
          />
        </div>
      )}
        <h2 className="text-3xl font-extrabold md:text-4xl group-hover:underline">
          {item.title}
        </h2>
        <div className="mt-2 text-base">
          <div>
            Current Donation:{' '}
            <span className="font-extrabold">{fmtTHB(item.currentDonation ?? 0)} THB</span>
          </div>
          <div>
            Expected Donation:{' '}
            <span className="font-extrabold">{fmtTHB(item.goal)} THB</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
