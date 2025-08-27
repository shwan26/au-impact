'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import type { CartItem } from '@/types/db';

const keyOf = (i: CartItem) => `${i.itemId}-${i.size}-${i.color}`;


export default function CartPage() {
  const { items, setQuantity, remove, total } = useCart();
  const router = useRouter();
  
  const setItems = useCheckout((s) => s.setItems);
  const clearSel = useCheckout((s) => s.clear);
  const setItemSingle = useCheckout((s) => s.setItem); // back-compat

  // Local checkbox selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allKeys = useMemo(() => items.map(keyOf), [items]);
  const allSelected = selected.size > 0 && selected.size === allKeys.length;
  const anySelected = selected.size > 0;

  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(keyOf(i))),
    [items, selected]
  );

  function toggleOne(i: CartItem) {
    const k = keyOf(i);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === allKeys.length ? new Set() : new Set(allKeys)
    );
  }

  function handleCheckoutSelected() {
    if (!anySelected) return;

    clearSel(); // reset selection store

    // Prefer multi-select API
    if (typeof setItems === 'function') {
      setItems(selectedItems);
    } else if (typeof setItemSingle === 'function') {
      // Fallback: only first item if project still uses single buy-now store
      setItemSingle(selectedItems[0]);
      if (selectedItems.length > 1) {
        alert('Your checkout store supports only one item; taking the first selected.');
      }
    }

    // route
    router.push('/public/merchandise/checkout');
  }

  function handleCheckoutAll() {
    if (typeof setItems === 'function') {
      setItems(items);         // multi-item selection
    } else if (typeof setItemSingle === 'function') {
      // Back-compat: at least pass the first item if your project still uses single-item checkout store
      if (items[0]) setItemSingle(items[0]);
    }
  
    router.push('/public/merchandise/checkout');
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Merchandise - Cart</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          Your cart is empty. <Link href="/public/merchandise" className="underline">Shop now</Link>
        </div>
      ) : (
        <>
          {/* Bulk controls */}
          <div className="mb-4 flex items-center justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span className="text-sm">Select all</span>
            </label>

            <div className="flex items-center gap-3">
              {anySelected && <div className="text-sm text-gray-600">Selected: {selected.size}</div>}
              <button
                onClick={handleCheckoutSelected}
                type="button"
                disabled={!anySelected}
                className={`rounded-full px-4 py-2 text-sm ring-1 ring-black ${
                  anySelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Checkout Selected
              </button>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-4">
            {items.map((i) => (
              <CartRow
                key={keyOf(i)}
                item={i}
                checked={selected.has(keyOf(i))}
                onToggle={() => toggleOne(i)}
                onQty={setQuantity}
                onRemove={(it) => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    next.delete(keyOf(it));
                    return next;
                  });
                  remove(it);
                }}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between">
            <Link href="/public/merchandise" className="rounded-full border px-4 py-2">Back</Link>
            <div className="flex items-center gap-6">
              <div className="text-lg font-semibold">Total: {total} Baht</div>
              <button
                onClick={handleCheckoutAll}
                className="rounded-full bg-black px-5 py-2 font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
                type="button"
              >
                Check Out All
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function CartRow({
  item, checked, onToggle, onQty, onRemove,
}: {
  item: CartItem;
  checked: boolean;
  onToggle: () => void;
  onQty: (i: CartItem, q: number) => void;
  onRemove: (i: CartItem) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
        <Image src={item.image} alt={item.title} fill className="object-cover" />
      </div>
      <div className="flex-1">
        <div className="text-lg font-semibold">{item.title}</div>
        <div className="text-sm text-gray-600">Size - {item.size}</div>
        <div className="text-sm text-gray-600">Color - {item.color}</div>
        <div className="mt-1 font-medium">{item.price * item.qty} Baht</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">Qty</span>
        <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
          <button onClick={() => onQty(item, Math.max(1, item.qty - 1))} className="px-2">−</button>
          <span className="px-2">{item.qty}</span>
          <button onClick={() => onQty(item, item.qty + 1)} className="px-2">+</button>
        </div>
        <button aria-label="remove" onClick={() => onRemove(item)} className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50">🗑</button>
      </div>
    </div>
  );
}
