// app/public/merchandise/checkout/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import type { CartItem } from '@/types/db';
import type { User } from '@supabase/supabase-js';

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, ''); // '' or '/portal'
const url = (p: string) => new URL(`${BASE_PATH}${p}`, window.location.origin).toString();

const keyOf = (i: CartItem) => `${i.itemId}-${i.size ?? ''}-${i.color ?? ''}`;
const isValidSrc = (src?: string) =>
  !!src && typeof src === 'string' && !!src.trim() && !/^(null|undefined)$/i.test(src);

export default function CheckoutPage() {
  const router = useRouter();

  // Supabase browser client (for auth + storage upload)
  const supabase = useMemo(() => createClient(), []);

  // Cart/selection
  const { items: cartItemsRaw, total: cartTotal } = useCart();
  const cartItems: CartItem[] = Array.isArray(cartItemsRaw) ? cartItemsRaw : [];

  const selItemsRaw = useCheckout((s) => s.items);
  const singleItem  = useCheckout((s) => s.item);
  const selItems: CartItem[] = Array.isArray(selItemsRaw) ? selItemsRaw : singleItem ? [singleItem] : [];

  const isSelectionMode = selItems.length > 0;
  const lineItems: CartItem[] = isSelectionMode ? selItems : cartItems;

  // Buyer info & upload UI
  const [fileName, setFileName] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [lineId, setLineId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 1) Require login: if no user, redirect to sign-in (with return path)
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (ignore) return;
      if (!data.user) {
        router.replace(
          `${BASE_PATH}/auth/sign-in?next=${encodeURIComponent(`${BASE_PATH}/public/merchandise/checkout`)}`
        );
        return;
      }
      setUser(data.user);
      setCheckingAuth(false);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, router]);

  // 2) Prefill buyer info from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pp:buyerInfo');
      if (!raw) return;
      const saved = JSON.parse(raw) as { buyerName?: string; studentId?: string; lineId?: string };
      if (saved.buyerName) setBuyerName(saved.buyerName);
      if (saved.studentId) setStudentId(saved.studentId);
      if (saved.lineId) setLineId(saved.lineId);
    } catch {
      // ignore
    }
  }, []);

  const computedTotal =
    lineItems.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0) || cartTotal;

  async function handleConfirm() {
    if (submitting) return;

    // Must be signed in (RLS requires auth.uid())
    if (!user) {
      alert('Please sign in to confirm your order.');
      router.replace('/auth/sign-in?next=/public/merchandise/checkout');
      return;
    }

    if (lineItems.length === 0) {
      alert('Cart is empty.');
      return;
    }
    if (!buyerName.trim() || !studentId.trim() || !lineId.trim()) {
      alert('Please fill your Name, Student ID, and LINE ID.');
      return;
    }

    setSubmitting(true);
    let slipUrl: string | null = null;

    try {
      // Optional slip upload (to merch bucket under user folder so RLS matches)
      if (slipFile) {
        const ext = slipFile.name.split('.').pop() || 'bin';
        const filePath = `order-slips/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('merch') // existing merch bucket
          .upload(filePath, slipFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: slipFile.type || 'application/octet-stream',
          });

        if (uploadError) {
          alert('❌ Failed to upload slip: ' + uploadError.message);
          setSubmitting(false);
          return;
        }

        // If bucket is public: use public URL; if private, prefer storing the path and generating signed URLs server-side.
        const { data: pub } = supabase.storage.from('merch').getPublicUrl(filePath);
        slipUrl = pub?.publicUrl ?? null;
      }

      // Create order via API (server computes official totals & prices)
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          slipUpload: slipUrl,
          lines: lineItems.map(i => ({
            itemId: Number(i.itemId),
            size: i.size ?? null,
            color: i.color ?? null,
            qty: i.qty ?? 1,
          })),
        }),
      });

      // 👇 don’t .json() a 404 HTML page
      const contentType = res.headers.get('content-type') || '';
      const raw = await res.text();
      const maybeJson = contentType.includes('application/json');
      const data = maybeJson ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || raw.slice(0, 200) || `HTTP ${res.status}`;
        alert('❌ Failed to create order: ' + msg);
        setSubmitting(false);
        return;
      }

      // Save small client state for success page (used to clear purchased lines)
      sessionStorage.setItem('pp:lastPurchased', JSON.stringify(lineItems.map(keyOf)));
      sessionStorage.setItem('pp:buyerInfo', JSON.stringify({ buyerName, studentId, lineId }));
      router.push(`${BASE_PATH}/public/merchandise/checkout/success`);
    } catch (err) {
      console.error(err);
      alert('❌ Something went wrong while placing the order.');
      setSubmitting(false);
    }
  }

  // While checking auth, you can render a lightweight placeholder
  if (checkingAuth) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-xl font-semibold">Merchandise - Checkout</h1>
        <p className="text-sm text-gray-600">Checking your session…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Merchandise - Checkout</h1>

      {lineItems.length === 0 ? (
        <div className="rounded-xl border p-6 text-center text-sm text-gray-600">
          Nothing to checkout.{' '}
          <Link className="underline" href={`${BASE_PATH}/public/merchandise/cart`}>
            Go back to cart
          </Link>
        </div>
      ) : (
        lineItems.map((i) => {
          const imgSrc = isValidSrc(i.image) ? i.image : '/images/placeholder.png';
          return (
            <div key={keyOf(i)} className="mb-4 flex items-center gap-4 rounded-xl border p-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
                <Image src={imgSrc} alt={i.title} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold">{i.title}</div>
                {i.size && <div className="text-sm text-gray-600">Size - {i.size}</div>}
                {i.color && <div className="text-sm text-gray-600">Color - {i.color}</div>}
                <div className="mt-1 font-medium">
                  {(Number(i.price) || 0) * (Number(i.qty) || 0)} Baht
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Qty</span>
                <span className="px-2">{i.qty}</span>
              </div>
            </div>
          );
        })
      )}

      <h2 className="mt-8 text-xl font-semibold">Total - {computedTotal} Baht</h2>

      {/* Buyer info */}
      <section className="mt-6 rounded-xl p-4">
        <h3 className="text-lg font-semibold">Your Information</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="buyer-name" className="mb-1 block text-sm text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="buyer-name"
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label htmlFor="student-id" className="mb-1 block text-sm text-gray-700">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              id="student-id"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g., 6612345"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label htmlFor="line-id" className="mb-1 block text-sm text-gray-700">
              LINE ID <span className="text-red-500">*</span>
            </label>
            <input
              id="line-id"
              type="text"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              placeholder="your_line_id"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </section>

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
                  setSlipFile(e.target.files[0]);
                  setFileName(e.target.files[0].name);
                } else {
                  setSlipFile(null);
                  setFileName('');
                }
              }}
            />
            <span className="text-sm text-gray-500">{fileName || 'No file chosen'}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Link href="/public/merchandise/cart" className="rounded-full border px-5 py-2">
          Back
        </Link>
        <button
          onClick={handleConfirm}
          className="rounded-full bg-black px-5 py-2 text-white disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? 'Confirming…' : 'Confirm'}
        </button>
      </div>
    </main>
  );
}
