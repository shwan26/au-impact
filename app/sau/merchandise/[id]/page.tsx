'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Merch = {
  itemId: number;
  title: string;
  price: number;
  status: string;
  contactName?: string | null;
  posterUrl?: string | null;
};

const LABEL_COL = 'min-w-[210px] pr-4 text-sm font-medium text-zinc-700';

export default function SAUMerchEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [merch, setMerch] = useState<Merch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/merchandise/${params.id}`, { cache: 'no-store' });
      if (!res.ok) setMerch(null);
      else setMerch(await res.json());
      setLoading(false);
    })();
  }, [params.id]);

  async function handleSave() {
    if (!merch) return;
    const res = await fetch(`/api/merchandise/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merch),
    });
    if (!res.ok) return alert('❌ Failed to save changes');
    alert('✅ Saved successfully');
    router.refresh();
  }

  async function handleSoldOut() {
    const res = await fetch(`/api/merchandise/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SOLD_OUT' }),
    });
    if (!res.ok) return alert('❌ Failed to mark sold out');
    alert('✅ Marked as sold out');
    router.refresh();
  }

  if (loading) return <div className="p-4">Loading…</div>;
  if (!merch) return <div className="p-4">Merchandise not found.</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Merchandise (SAU)</h1>
        <Link
          href={`/sau/merchandise/${merch.itemId}/pickup`}
          className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-300"
        >
          Add Pickup
        </Link>
      </div>

      <div className="space-y-3">
        <Row label="Merchandise Number">
          <div className="font-mono">{merch.itemId}</div>
        </Row>

        <Field label="Merchandise Name" value={merch.title} onChange={(val) => setMerch((m) => m && { ...m, title: val })} />
        <Field label="Contact Person" value={merch.contactName ?? ''} onChange={(val) => setMerch((m) => m && { ...m, contactName: val })} />
        <Field label="Price" value={String(merch.price)} onChange={(val) => setMerch((m) => m && { ...m, price: Number(val || 0) })} />

        <Row label="Poster">
          {merch.posterUrl ? (
            <Image src={merch.posterUrl} alt="Poster" width={120} height={120} className="rounded-md border" />
          ) : (
            <span>No image</span>
          )}
        </Row>

        <div className="mt-4 flex gap-3">
          <button type="button" onClick={handleSave} className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-300">
            Save
          </button>
          <button type="button" onClick={handleSoldOut} className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
            Sold out
          </button>
        </div>
      </div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className={LABEL_COL}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <Row label={label}>
      <input
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full max-w-md rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </Row>
  );
}
