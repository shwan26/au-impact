// app/public/merchandise/checkout/success/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import type { CartItem } from '@/types/db';

const keyOf = (i: CartItem) => `${i.itemId}-${i.size ?? ''}-${i.color ?? ''}`;

export default function CheckoutSuccessPage() {
  const cartItems = useCart((s) => s.items as CartItem[]);
  const removeFromCart = useCart((s) => s.remove);
  const clearSelection = useCheckout((s) => s.clear);

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    clearSelection?.();

    try {
      const raw = sessionStorage.getItem('pp:lastPurchased');
      const purchasedKeys: unknown = raw ? JSON.parse(raw) : [];

      if (Array.isArray(purchasedKeys) && purchasedKeys.length > 0) {
        for (const item of cartItems) {
          if (purchasedKeys.includes(keyOf(item))) {
            removeFromCart(item);
          }
        }
      }

      sessionStorage.removeItem('pp:lastPurchased');
    } catch {
      // ignore JSON/storage issues
    }
  }, [cartItems, clearSelection, removeFromCart]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="mb-3 text-2xl font-semibold">Payment Successful 🎉</h1>
      <p className="mb-8 text-gray-600">
        Thanks! We’ve recorded your payment. Your purchased items have been removed from the cart.
      </p>
      <Link href="/public/merchandise" className="rounded-full border px-5 py-2">
        Continue Shopping
      </Link>
    </main>
  );
}
