"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";

/** Local minimal shape */
type LineItem = {
  itemId: string;
  title: string;
  image: string;
  size?: string;
  color?: string;
  qty?: number;
  price?: number;
};

const isLineItem = (x: any): x is LineItem =>
  x && typeof x.itemId === "string" && typeof x.title === "string" && typeof x.image === "string";

const keyOf = (i: LineItem) => `${i.itemId}-${i.size ?? ""}-${i.color ?? ""}`;

export default function CheckoutSuccessPage() {
  // Read whole stores (no selectors)
  const cartStore: any = useCart();
  const checkoutStore: any = useCheckout();

  const cartItems: LineItem[] = Array.isArray(cartStore?.items)
    ? cartStore.items.filter(isLineItem)
    : [];

  const removeFromCart: ((i: any) => void) | undefined =
    typeof cartStore?.remove === "function" ? cartStore.remove : undefined;

  const clearSelection: (() => void) | undefined =
    typeof checkoutStore?.clear === "function" ? checkoutStore.clear : undefined;

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    clearSelection?.();

    try {
      const raw = sessionStorage.getItem("pp:lastPurchased");
      const purchasedKeys: unknown = raw ? JSON.parse(raw) : [];

      if (Array.isArray(purchasedKeys) && purchasedKeys.length > 0) {
        for (const item of cartItems) {
          if (purchasedKeys.includes(keyOf(item))) {
            removeFromCart?.(item); // if your store expects id: use removeFromCart?.(item.itemId)
          }
        }
      }

      sessionStorage.removeItem("pp:lastPurchased");
    } catch {
      /* ignore */
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
