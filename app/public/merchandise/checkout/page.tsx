"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";

/** Local minimal shape to avoid project type coupling */
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

export default function CheckoutPage() {
  // ---- read whole cart store once (no selectors)
  const cartStore: any = useCart();
  const cartItems: LineItem[] = Array.isArray(cartStore?.items)
    ? cartStore.items.filter(isLineItem)
    : [];
  const cartTotal: number = typeof cartStore?.total === "number" ? cartStore.total : 0;

  // ---- checkout store (array or single)
  const checkoutStore: any = useCheckout();
  const selItemsRaw = checkoutStore?.items;
  const selItemRaw = checkoutStore?.item;

  const selectedArray: LineItem[] = Array.isArray(selItemsRaw)
    ? selItemsRaw.filter(isLineItem)
    : [];
  const selectedSingle: LineItem[] = isLineItem(selItemRaw) ? [selItemRaw] : [];

  // Prefer explicit selection; else fallback to cart
  const lineItems: LineItem[] = useMemo(
    () => (selectedArray.length ? selectedArray : selectedSingle.length ? selectedSingle : cartItems),
    [selectedArray, selectedSingle, cartItems]
  );

  const router = useRouter();
  const [fileName, setFileName] = useState("");

  // Buyer info
  const [buyerName, setBuyerName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [lineId, setLineId] = useState("");

  // Prefill buyer info
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pp:buyerInfo");
      if (!raw) return;
      const saved = JSON.parse(raw) as { buyerName?: string; studentId?: string; lineId?: string };
      if (saved.buyerName) setBuyerName(saved.buyerName);
      if (saved.studentId) setStudentId(saved.studentId);
      if (saved.lineId) setLineId(saved.lineId);
    } catch {
      /* ignore */
    }
  }, []);

  const computedTotal = useMemo(() => {
    const fromLines =
      lineItems.reduce(
        (sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0),
        0
      ) || 0;
    return fromLines || cartTotal;
  }, [lineItems, cartTotal]);

  function handleConfirm() {
    if (!lineItems.length) {
      alert("Cart is empty.");
      return;
    }
    if (!buyerName.trim() || !studentId.trim() || !lineId.trim()) {
      alert("Please fill your Name, Student ID, and LINE ID.");
      return;
    }
    try {
      const purchasedKeys = lineItems.map(keyOf);
      sessionStorage.setItem("pp:lastPurchased", JSON.stringify(purchasedKeys));
      sessionStorage.setItem("pp:buyerInfo", JSON.stringify({ buyerName, studentId, lineId }));
    } catch {
      /* ignore */
    }
    router.push("/public/merchandise/checkout/success");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Merchandise - Checkout</h1>

      {!lineItems.length ? (
        <div className="rounded-xl border p-6 text-center text-sm text-gray-600">
          Nothing to checkout.{" "}
          <Link className="underline" href="/public/merchandise/cart">
            Go back to cart
          </Link>
        </div>
      ) : (
        lineItems.map((i) => (
          <div key={keyOf(i)} className="mb-4 flex items-center gap-4 rounded-xl border p-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
              <Image src={i.image} alt={i.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold">{i.title}</div>
              <div className="text-sm text-gray-600">Size - {i.size || "-"}</div>
              <div className="text-sm text-gray-600">Color - {i.color || "-"}</div>
              <div className="mt-1 font-medium">
                {(Number(i.price) || 0) * (Number(i.qty) || 0)} Baht
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Qty</span>
              <span className="px-2">{i.qty ?? 0}</span>
            </div>
          </div>
        ))
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
                const f = e.target.files?.[0];
                setFileName(f ? f.name : "");
              }}
            />
            <span className="text-sm text-gray-500">{fileName || "No file chosen"}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Link href="/public/merchandise/cart" className="rounded-full border px-5 py-2">
          Back
        </Link>
        <button onClick={handleConfirm} className="rounded-full bg-black px-5 py-2 text-white">
          Confirm
        </button>
      </div>
    </main>
  );
}
