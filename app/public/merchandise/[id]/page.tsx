'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';

import { merches } from '@/lib/mock';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import type { Merch, MerchSize } from '@/types/db';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const found = merches.find((p) => p.slug === id);
  if (!found) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/public/merchandise" className="text-sm underline">
            ← Back to Merchandise
          </Link>
          <Link
            href="/public/merchandise/checkout"
            className="rounded-full px-4 py-2 text-sm ring-1 ring-black"
          >
            🛒 Cart
          </Link>
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Not found</h1>
        <p className="text-gray-600">
          The merchandise you’re looking for does not exist.
        </p>
      </main>
    );
  }

const product: Merch = found;
  const { add, items } = useCart();
  const { setItem: setCheckoutItem } = useCheckout();
  const cartCount = items.length;

  const [color, setColor] = useState(product?.availableColors[0]?.code);
  const [size, setSize] = useState<MerchSize>(
    (product?.availableSizes[0] as MerchSize) || 'M'
  );
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/public/merchandise" className="text-sm underline">
            ← Back to Merchandise
          </Link>
          <Link
            href="/public/merchandise/checkout"
            className="rounded-full px-4 py-2 text-sm ring-1 ring-black"
          >
            🛒 Cart
          </Link>
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Not found</h1>
        <p className="text-gray-600">
          The merchandise you’re looking for does not exist.
        </p>
      </main>
    );
  }

  function handleAdd(toCheckout = false) {
    if (!size) {
      alert('Please select a size');
      return;
    }
    const line = {
      itemId: product.itemId,
      slug: product.slug,
      title: product.title,
      price: product.price,
      size,
      color: color || '',
      qty,
      image: product.images.poster.url,
    };

    if (toCheckout) {
      setCheckoutItem(line);
      router.push('/public/merchandise/checkout');
    } else {
      add(line);
      router.push('/public/merchandise/cart');
    }
  }

  const tiles = [
    product.images.poster,
    product.images.frontView,
    product.images.sizeChart,
    ...(product.images.misc || []),
  ].filter(Boolean) as { alt: string; url: string }[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href="/public/merchandise" className="text-sm underline">
          ← Back to Merchandise
        </Link>
        <Link href="/public/merchandise/cart">🛒 ({cartCount})</Link>
      </div>

      <h1 className="mb-4 mt-2 text-2xl font-semibold">
        Merchandise – {product.title}
      </h1>

      {/* Image tiles */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {tiles.slice(0, 4).map((img, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-xl"
          >
            <Image src={img.url} alt={img.alt} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Price */}
      <p className="mt-6 text-3xl font-extrabold">{product.price} Baht</p>

      {/* Order Form */}
      <section className="mt-4 space-y-5">
        {product.availableColors?.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Color</div>
            <div className="flex gap-3">
              {product.availableColors.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setColor(c.code)}
                  className={`rounded-xl p-1 transition ${
                    color === c.code ? 'ring-2 ring-black' : ''
                  }`}
                  title={c.name}
                  type="button"
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                    <Image
                      src={c.thumbnail}
                      alt={c.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {product.availableSizes?.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Size</div>
            <div className="flex flex-wrap gap-3">
              {product.availableSizes.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSize(s as MerchSize)}
                  className={`h-9 w-14 rounded-full border text-sm transition ${
                    size === s ? 'bg-black text-white' : 'bg-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-sm">Qty</span>
          <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-2"
              type="button"
            >
              −
            </button>
            <span className="px-2">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="px-2"
              type="button"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-4">
          <button
            onClick={() => handleAdd(false)}
            className="rounded-full border px-5 py-2"
            type="button"
          >
            Add To Cart
          </button>
          <button
            onClick={() => handleAdd(true)}
            className="rounded-full bg-black px-5 py-2 text-white"
            type="button"
          >
            Buy Now
          </button>
        </div>
      </section>
    </main>
  );
}
