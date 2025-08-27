// app/public/merchandise/checkout/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import type { CartItem } from '@/types/db';

const keyOf = (i: CartItem) => `${i.itemId}-${i.size}-${i.color}`;

export default function CheckoutPage() {
  
  const cartItemsRaw = useCart((s) => s.items);
  const cartItems: CartItem[] = Array.isArray(cartItemsRaw) ? cartItemsRaw : [];
  const cartTotalRaw = useCart((s) => s.total);
  const cartTotal = typeof cartTotalRaw === 'number' ? cartTotalRaw : 0;
  const clearCart = useCart((s) => s.clear);
  const setCartQty = useCart((s) => s.setQuantity);
  const removeFromCart = useCart((s) => s.remove);

  
  const selItemsRaw = useCheckout((s) => s.items);
  const singleItem = useCheckout((s) => s.item);
  const selItems: CartItem[] = Array.isArray(selItemsRaw)
    ? selItemsRaw
    : singleItem
    ? [singleItem]
    : [];

  const setSelQty = useCheckout((s) => s.updateQty);
  const removeFromSel = useCheckout((s) => s.remove);
  const clearSel = useCheckout((s) => s.clear);

  const router = useRouter();
  const [fileName, setFileName] = useState<string>('');


  const isSelectionMode = selItems.length > 0;
  const candidate = isSelectionMode ? selItems : cartItems;
  const lineItems: CartItem[] = Array.isArray(candidate) ? candidate : [];

  const computedTotal =
    lineItems.reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0),
      0
    ) || cartTotal;

  function handleConfirm() {
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      alert('Cart is empty.');
      return;
    }

    try {
      const purchasedKeys = lineItems.map(keyOf);
      sessionStorage.setItem('pp:lastPurchased', JSON.stringify(purchasedKeys));
    } catch {
     
    }

    

    router.push('/public/merchandise/checkout/success');
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Merchandise - Checkout</h1>

      {lineItems.length === 0 ? (
        <div className="rounded-xl border p-6 text-center text-sm text-gray-600">
          Nothing to checkout.{' '}
          <Link className="underline" href="/public/merchandise/cart">
            Go back to cart
          </Link>
        </div>
      ) : (
        lineItems.map((i) => (
          <div
            key={keyOf(i)}
            className="mb-4 flex items-center gap-4 rounded-xl border p-4"
          >
            <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
              <Image src={i.image} alt={i.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold">{i.title}</div>
              <div className="text-sm text-gray-600">Size - {i.size}</div>
              <div className="text-sm text-gray-600">Color - {i.color}</div>
              <div className="mt-1 font-medium">
                {(Number(i.price) || 0) * (Number(i.qty) || 0)} Baht
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Qty</span>
              <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
                <button
                  onClick={() =>
                    isSelectionMode
                      ? setSelQty(i, Math.max(1, (i.qty || 1) - 1))
                      : setCartQty(i, Math.max(1, (i.qty || 1) - 1))
                  }
                  className="px-2"
                >
                  −
                </button>
              </div>
              <span className="px-2">{i.qty}</span>
              <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
                <button
                  onClick={() =>
                    isSelectionMode
                      ? setSelQty(i, (i.qty || 1) + 1)
                      : setCartQty(i, (i.qty || 1) + 1)
                  }
                  className="px-2"
                >
                  +
                </button>
              </div>
              <button
                onClick={() =>
                  isSelectionMode ? removeFromSel(i) : removeFromCart(i)
                }
                className="rounded-full border px-3 py-1 text-sm"
              >
                🗑
              </button>
            </div>
          </div>
        ))
      )}

      <h2 className="mt-8 text-xl font-semibold">
        Total - {computedTotal} Baht
      </h2>

      <div className="mt-6 grid gap-6 md:grid-cols-2">

        <div className="flex flex-col items-center">
          <div className="mb-2 text-sm text-gray-600">PromptPay</div>
          <div className="relative h-40 w-40">
            <Image
              src="/images/promptpay.png" 
              alt="PromptPay QR Code"
              fill
              className="rounded-xl object-contain"
              priority
            />
          </div>
         
        </div>

        {/* File Upload */}
        <div>
          <div className="mb-2 text-sm text-gray-600">Upload Slip</div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="slip-upload"
              className="cursor-pointer rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Choose File
            </label>
            <input
              id="slip-upload"
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFileName(e.target.files[0].name);
                } else {
                  setFileName('');
                }
              }}
            />
            <span className="text-sm text-gray-500">
              {fileName || 'No file chosen'}
            </span>
          </div>
         
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Link
          href="/public/merchandise/cart"
          className="rounded-full border px-5 py-2"
        >
          Back
        </Link>
        <button
          onClick={handleConfirm}
          className="rounded-full bg-black px-5 py-2 text-white"
        >
          Confirm
        </button>
      </div>
    </main>
  );
}
