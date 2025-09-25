// app/sau/merchandise/[id]/pickup/page.tsx
'use client';

import { notFound, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getMerchById } from '@/lib/mock';
import React from 'react';

export default function SAUMerchPickupPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/merchandise/${id}`);
      setExists(r.ok);
    })();
  }, [id]);

  if (exists === null) return <div className="p-4">Loading...</div>;
  if (!exists) return notFound();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (file) fd.set('pickupPhoto', file);
    const res = await fetch(`/api/merchandise/${id}`, { method: 'PATCH', body: fd });
    if (!res.ok) {
      const j = await res.json();
      alert(j.error || 'Failed to save');
      return;
    }
    router.push(`/sau/merchandise/${id}`);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 space-y-5">
      <h1 className="text-2xl font-extrabold">Pickup Location</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <Row label="Pickup Location">
          <input name="pickupLocation" placeholder="e.g., CL 11th Floor"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200" />
        </Row>
        <Row label="Merchandise Number">
          <div className="py-2 font-mono">{item.itemId}</div>
          <input type="hidden" name="itemId" value={item.itemId} />
        </Row>

        <Row label="Merchandise Name">
          <input
            name="title"
            defaultValue={item.title}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Photo">
          <label
            htmlFor="pickup-photo"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200"
          >
            <span className="text-xl">＋</span>
            <span>{file ? file.name : 'Upload .png, .jpg, .jpeg'}</span>
          </label>
          <input
            id="pickup-photo"
            name="photo"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)}
            className="hidden"
          />
        </Row>
        <Row label="Pickup Location">
          <input
            name="pickupPoint"
            placeholder="e.g., CL 11th Floor"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Pickup Date">
          <input
            name="pickupDate"
            type="text"
            placeholder="e.g., 28 Jan – 14 Feb"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Pickup Time">
          <input
            name="pickupTime"
            type="text"
            placeholder="e.g., 10:30 – 15:00"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>
        <div className="pt-2">
          <button type="submit" className="rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300">
            Save
          </button>
        </div>
      </form>
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
