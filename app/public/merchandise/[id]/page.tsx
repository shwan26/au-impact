import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Merch } from '@/types/db';
import { CartButton, PurchaseForm } from './MerchClient';

export default async function Page({ params }: { params: { id: string } }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/merchandise/${params.id}`,
    { cache: 'no-store' }
  );

  if (!res.ok) return notFound();
  const data = await res.json();

  if (!data) return notFound();

  // Map API fields into your Merch type
  const merch: Merch = {
    itemId: String(data.ItemID),
    slug: String(data.Title ?? '').toLowerCase().replace(/\s+/g, '-'),
    title: String(data.Title ?? ''),
    description: data.Description ?? '',
    price: Number(data.Price ?? 0),
    availableSizes: [], // extend later if needed
    availableColors: [],
    images: {
      poster: { alt: 'Poster', url: data.PosterURL ?? '' },
      frontView: data.FrontURL ? { alt: 'Front', url: data.FrontURL } : undefined,
      backView: undefined, // 👈 explicitly included to satisfy type
      sizeChart: data.SizeChartURL
        ? { alt: 'Size Chart', url: data.SizeChartURL }
        : undefined,
      misc: Array.isArray(data.MiscURLs)
        ? data.MiscURLs.map((u: string, idx: number) => ({
            alt: `Misc ${idx + 1}`,
            url: u,
          }))
        : [],
    },
  } as Partial<Merch> as Merch;

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
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href="/public/merchandise" className="text-sm underline">
          ← Back to Merchandise
        </Link>
        <CartButton />
      </div>

      <h1 className="mb-4 mt-2 text-2xl font-semibold">
        Merchandise – {merch.title}
      </h1>

      {/* Image tiles */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {tiles.map((img, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-xl"
          >
            <Image src={img.url} alt={img.alt} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Price */}
      <p className="mt-6 text-3xl font-extrabold">{merch.price} Baht</p>

      {/* Interactive order form (client) */}
      <PurchaseForm merch={merch} />
    </main>
  );
}
