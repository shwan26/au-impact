'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import type { Merch } from '@/types/db';

export function CartButton() {
  const { items } = useCart();
  const count = items.reduce((sum, it) => sum + (it.qty ?? 1), 0);

  return (
    <button
      type="button"
      className="rounded-full border px-4 py-2 text-sm hover:bg-zinc-100"
      onClick={() => {
        // redirect to cart page
        window.location.href = '/public/merchandise/cart';
      }}
    >
      🛒 Cart ({count})
    </button>
  );
}

export function PurchaseForm({ merch }: { merch: Merch }) {
  const { add } = useCart();

  const [size, setSize] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [qty, setQty] = useState<number>(1);

  function handleAdd() {
    add({
      itemId: merch.itemId,
      title: merch.title,
      price: merch.price,
      qty,
      size,
      color,
      image: merch.images.poster.url,
    });
    alert('✅ Added to cart');
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Size options */}
      {merch.availableSizes?.length > 0 && (
        <div>
          <label className="block text-sm font-medium">Size</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1 rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Select size</option>
            {merch.availableSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Color options */}
      {merch.availableColors?.length > 0 && (
        <div>
          <label className="block text-sm font-medium">Color</label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Select color</option>
            {merch.availableColors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium">Quantity</label>
        <input
          type="number"
          value={qty}
          min={1}
          onChange={(e) => setQty(Number(e.target.value))}
          className="mt-1 w-20 rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Add to Cart
      </button>
    </div>
  );
}
