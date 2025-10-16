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

  // Normalize DB response into our Merch type
  const merch: Merch = {
    itemId: String(data.ItemID ?? data.itemId ?? ''),
    slug: String(data.Title ?? data.title ?? '')
      .toLowerCase()
      .replace(/\s+/g, '-'),
    title: String(data.Title ?? data.title ?? ''),
    description: data.Description ?? data.description ?? '',
    price: Number(data.Price ?? data.price ?? 0),
    status: data.Status ?? data.status ?? 'PENDING',
    availableSizes: [], // extend if needed
    availableColors: [],
    images: {
      poster: { alt: 'Poster', url: data.PosterURL ?? data.posterUrl ?? '' },
      frontView: data.FrontViewURL
        ? { alt: 'Front', url: data.FrontViewURL }
        : data.frontUrl
        ? { alt: 'Front', url: data.frontUrl }
        : undefined,
      backView: data.BackViewURL
        ? { alt: 'Back', url: data.BackViewURL }
        : data.backUrl
        ? { alt: 'Back', url: data.backUrl }
        : undefined,
      sizeChart: data.SizeChartURL
        ? { alt: 'Size Chart', url: data.SizeChartURL }
        : data.sizeChartUrl
        ? { alt: 'Size Chart', url: data.sizeChartUrl }
        : undefined,
      misc: Array.isArray(data.MiscURLs ?? data.miscUrls)
        ? (data.MiscURLs ?? data.miscUrls).map((u: string, idx: number) => ({
            alt: `Misc ${idx + 1}`,
            url: u,
          }))
        : [],
    },
  };

  const tiles = [
    merch.images.poster,
    merch.images.frontView,
    merch.images.backView,
    merch.images.sizeChart,
    ...(merch.images.misc ?? []),
  ].filter(Boolean) as { alt: string; url: string }[];

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

      {/* Interactive order form */}
      <PurchaseForm merch={merch} />
    </main>
  );
}
