// app/sau/merchandise/[id]/pickup/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type MerchLite = {
  itemId: string;
  title: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'SOLD_OUT' | 'LIVE';
  pickupPoint?: string;
  pickupDate?: string;
  pickupTime?: string;
};

export default function SAUMerchPickupPage({ params }: { params: Promise<{ id: string }> } ) {
  const { id } = React.use(params);
  const router = useRouter();

  const [item, setItem] = useState<MerchLite | null>(null);
  const [loading, setLoading] = useState(true);

  const [pickupPoint, setPickupPoint] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/merchandise/${id}`);
        if (!r.ok) {
          setItem(null);
          return;
        }
        const j = await r.json();
        if (!alive) return;

        const m: MerchLite = j;
        setItem(m);
        setPickupPoint(m.pickupPoint ?? '');
        setPickupDate(m.pickupDate ?? '');
        setPickupTime(m.pickupTime ?? '');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!item) return;

    if (item.status !== 'APPROVED') {
      alert('Pickup details can only be added after AUSO approval.');
      return;
    }

    // Send JSON (no files involved)
    const res = await fetch(`/api/merchandise/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupPoint: pickupPoint.trim(),
        pickupDate: pickupDate.trim(),
        pickupTime: pickupTime.trim(),
      }),
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(j.error || 'Failed to save');
      return;
    }
    router.push(`/sau/merchandise/${id}`);
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!item) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-xl font-bold">Not found</h1>
        <p className="text-zinc-600 mt-2">This merchandise item does not exist or you don’t have access.</p>
      </main>
    );
  }

  const locked = item.status !== 'APPROVED';

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 space-y-5">
      <h1 className="text-2xl font-extrabold">Pickup Details</h1>

      <div className="rounded-md border border-zinc-200 p-4">
        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <div className="text-sm text-zinc-600">Merchandise Number</div>
          <div className="font-mono">{item.itemId}</div>

          <div className="text-sm text-zinc-600">Merchandise Name</div>
          <div>{item.title}</div>

          <div className="text-sm text-zinc-600">Status</div>
          <div className={locked ? 'text-amber-600' : 'text-emerald-700'}>{item.status}</div>
        </div>
      </div>

      {locked ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">
          AUSO has not approved this item yet. Once the status is <span className="font-semibold">APPROVED</span>, you can add pickup details here.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Row label="Pickup Location">
            <input
              name="pickupPoint"
              placeholder="e.g., CL 11th Floor"
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </Row>

          <Row label="Pickup Date">
            <input
              name="pickupDate"
              type="text"
              placeholder="e.g., 28 Jan – 14 Feb"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </Row>

          <Row label="Pickup Time">
            <input
              name="pickupTime"
              type="text"
              placeholder="e.g., 10:30 – 15:00"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </Row>

          <div className="pt-2">
            <button type="submit" className="rounded-md bg-zinc-900 px-6 py-2 font-medium text-white hover:bg-zinc-800">
              Save
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
