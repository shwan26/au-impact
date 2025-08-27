// app/public/merchandise/[id]/MerchClient.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { Merch, MerchSize } from '@/types/db';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';

export function CartButton() {
  const { items } = useCart();
  const count = useMemo(() => items.reduce((s, it) => s + (it.qty ?? 1), 0), [items]);
  return (
    <Link href="/public/merchandise/cart" className="rounded-full px-4 py-2 text-sm ring-1 ring-black">
      🛒 {count}
    </Link>
  );
}

export function PurchaseForm({ merch }: { merch: Merch }) {
  const router = useRouter();
  const { add } = useCart();
  const { setItem: setCheckoutItem } = useCheckout();

  const [color, setColor] = useState<string>(merch.availableColors?.[0]?.code ?? '');
  const [size, setSize] = useState<MerchSize>(
    (merch.availableSizes?.[0] as MerchSize) ?? 'M'
  );
  const [qty, setQty] = useState<number>(1);

  function handleAdd(toCheckout = false) {
    if (!size) {
      alert('Please select a size');
      return;
    }
    const line = {
      itemId: merch.itemId,
      slug: merch.slug,
      title: merch.title,
      price: merch.price,
      size,
      color: color || '',
      qty,
      image: merch.images.poster.url,
    };

    if (toCheckout) {
      setCheckoutItem(line);
      router.push('/public/merchandise/checkout');
    } else {
      add(line);
      router.push('/public/merchandise/cart');
    }
  }

  return (
    <section className="mt-4 space-y-5">
      {merch.availableColors?.length ? (
        <div className="space-y-2">
          <div className="text-sm font-medium">Color</div>
          <div className="flex gap-3">
            {merch.availableColors.map((c) => (
              <button
                key={c.code}
                onClick={() => setColor(c.code)}
                className={`rounded-xl p-1 transition ${color === c.code ? 'ring-2 ring-black' : ''}`}
                title={c.name}
                type="button"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                  <Image src={c.thumbnail} alt={c.name} fill className="object-cover" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {merch.availableSizes?.length ? (
        <div className="space-y-2">
          <div className="text-sm font-medium">Size</div>
          <div className="flex flex-wrap gap-3">
            {merch.availableSizes.map((s) => (
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
      ) : null}

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
  );
}
