// app/public/merchandise/[id]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Merch } from '@/types/db';
import { merches } from '@/lib/mock';
import { CartButton, PurchaseForm } from './MerchClient';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const merch = merches.find((m) => m.slug === id) as Merch | undefined;
  if (!merch) return notFound();

  const tiles = [
    merch.images.poster,
    merch.images.frontView,
    merch.images.sizeChart,
    ...(merch.images.misc || []),
  ]
    .filter(Boolean)
    .slice(0, 4) as { alt: string; url: string }[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between">
        <Link href="/public/merchandise" className="text-sm underline">
          ← Back to Merchandise
        </Link>
        <CartButton />
      </div>

      <h1 className="mb-4 mt-2 text-2xl font-semibold">
        Merchandise – {merch.title}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {tiles.map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
            <Image src={img.url} alt={img.alt} fill className="object-cover" />
          </div>
        ))}
      </div>

      <p className="mt-6 text-3xl font-extrabold">{merch.price} Baht</p>

      <PurchaseForm merch={merch} />
    </main>
  );
}
