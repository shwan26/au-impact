// app/public/merchandise/cart/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useCallback } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import type { CartItem } from '@/types/db';

const keyOf = (i: CartItem) => `${i.itemId}-${i.size ?? ''}-${i.color ?? ''}`;

export default function CartPage() {
  const router = useRouter();

  // cart store
  const { items, setQuantity, remove } = useCart();

  // checkout store (supporting both multi- and single-item APIs)
  const setItems = useCheckout((s) => s.setItems as ((items: CartItem[]) => void) | undefined);
  const clearSel = useCheckout((s) => s.clear);
  const setItemSingle = useCheckout((s) => s.setItem as ((item: CartItem) => void) | undefined);

  // Local selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allKeys = useMemo(() => items.map(keyOf), [items]);
  const allSelected = selected.size > 0 && selected.size === allKeys.length;
  const anySelected = selected.size > 0;

  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(keyOf(i))),
    [items, selected]
  );

  const selectedTotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, i) => sum + Number(i.price ?? 0) * Number(i.qty ?? 0),
        0
      ),
    [selectedItems]
  );

  const toggleOne = useCallback((i: CartItem) => {
    const k = keyOf(i);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === allKeys.length ? new Set() : new Set(allKeys)
    );
  }, [allKeys]);

  const handleRemove = useCallback(
    (it: CartItem) => {
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(keyOf(it));
        return next;
      });
      remove(it);
    },
    [remove]
  );

  const handleCheckoutSelected = useCallback(() => {
    if (!anySelected) return;

    clearSel?.(); // reset selection store

    if (setItems) {
      setItems(selectedItems);
    } else if (setItemSingle) {
      setItemSingle(selectedItems[0]);

      if (selectedItems.length > 1) {
        alert('Your checkout store supports only one item; taking the first selected.');
      }
    }

    router.push('/public/merchandise/checkout');
  }, [anySelected, clearSel, router, selectedItems, setItems, setItemSingle]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Merchandise - Cart</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          Your cart is empty.{' '}
          <Link href="/public/merchandise" className="underline">
            Shop now
          </Link>
        </div>
      ) : (
        <>
          {/* Bulk controls */}
          <div className="mb-4 flex items-center justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span className="text-sm">Select all</span>
            </label>
          </div>

          {/* Rows */}
          <div className="space-y-4">
            {items.map((i) => {
              const k = keyOf(i);
              return (
                <CartRow
                  key={k}
                  item={i}
                  checked={selected.has(k)}
                  onToggle={() => toggleOne(i)}
                  onQty={setQuantity}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between">
            <Link href="/public/merchandise" className="rounded-full border px-4 py-2">
              Back
            </Link>
            <div className="flex items-center gap-6">
              <div className="text-lg font-semibold">Total: {selectedTotal} Baht</div>
              <div className="flex items-center gap-3">
                {anySelected ? (
                  <div className="text-sm text-gray-600">Selected: {selected.size}</div>
                ) : null}
                <button
                  onClick={handleCheckoutSelected}
                  type="button"
                  disabled={!anySelected}
                  className={`rounded-full px-4 py-2 text-sm ring-1 ring-black ${
                    anySelected
                      ? 'bg-black text-white'
                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                  }`}
                >
                  Checkout Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function CartRow({
  item,
  checked,
  onToggle,
  onQty,
  onRemove,
}: {
  item: CartItem;
  checked: boolean;
  onToggle: () => void;
  onQty: (i: CartItem, q: number) => void;
  onRemove: (i: CartItem) => void;
}) {
  const lineTotal = useMemo(
    () => Number(item.price ?? 0) * Number(item.qty ?? 0),
    [item.price, item.qty]
  );

  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
        <Image src={item.image} alt={item.title} fill className="object-cover" />
      </div>
      <div className="flex-1">
        <div className="text-lg font-semibold">{item.title}</div>
        <div className="text-sm text-gray-600">Size — {item.size}</div>
        <div className="text-sm text-gray-600">Color — {item.color}</div>
        <div className="mt-1 font-medium">{lineTotal} Baht</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">Qty</span>
        <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
          <button onClick={() => onQty(item, Math.max(1, (item.qty ?? 1) - 1))} className="px-2">
            −
          </button>
          <span className="px-2">{item.qty}</span>
          <button onClick={() => onQty(item, (item.qty ?? 0) + 1)} className="px-2">
            +
          </button>
        </div>
        <button
          aria-label="remove"
          onClick={() => onRemove(item)}
          className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
