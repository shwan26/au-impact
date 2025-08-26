// components/cards/FundraisingCard.tsx
'use client';

import Link from 'next/link';
import type { Fundraising } from '@/types/db';

const fmtTHB = (n: number) => n.toLocaleString('en-US');

export default function FundraisingCard({ item }: { item: Fundraising }) {
  return (
    <Link href={`/public/fundraising/${item.id}`} className="block group">
      <div className="max-w-3xl">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="mb-4 h-56 w-full rounded-lg object-cover md:h-64"
            loading="lazy"
          />
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
