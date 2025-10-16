// app/public/merchandise/[id]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import type { Merch } from '@/types/db';
import { CartButton, PurchaseForm } from './MerchClient';

function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/+$/, '');
  const h = headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return 'http://localhost:3000';
  return `${proto}://${host}`;
}

function isValidSrc(src: unknown): src is string {
  if (!src || typeof src !== 'string') return false;
  // reject empty, whitespace, or 'null'/'undefined' strings
  if (!src.trim() || /^(null|undefined)$/i.test(src)) return false;
  // allow absolute http(s) or site-rooted /path
  return /^https?:\/\//.test(src) || src.startsWith('/');
}

export default async function Page({ params }: { params: { id: string } }) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/merchandise/${encodeURIComponent(params.id)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return notFound();

  const merch = (await res.json()) as Merch;
  if (!merch) return notFound();
  if (String(merch.status ?? '').toUpperCase() !== 'APPROVED') return notFound();

  const rawTiles: Array<{ alt: string; url: string } | undefined> = [
    merch.images?.poster,
    merch.images?.frontView,
    merch.images?.backView,
    merch.images?.sizeChart,
    ...(merch.images?.misc ?? []),
  ];

  const tiles = rawTiles.filter(
    (img): img is { alt: string; url: string } => !!img && isValidSrc(img.url)
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href="/public/merchandise" className="text-sm underline">
          ← Back to Merchandise
        </Link>
        <CartButton />
      </div>

      <h1 className="mb-4 mt-2 text-2xl font-semibold">Merchandise – {merch.title}</h1>

      {/* Image tiles */}
      {tiles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {tiles.slice(0, 4).map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
              <Image src={img.url} alt={img.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 grid place-content-center">
            <span className="text-zinc-500 text-sm">No images</span>
          </div>
        </div>
      )}

      {/* Price */}
      <p className="mt-6 text-3xl font-extrabold">{merch.price} Baht</p>

      {/* Interactive order form (client) */}
      <PurchaseForm merch={merch} />
    </main>
  );
}
