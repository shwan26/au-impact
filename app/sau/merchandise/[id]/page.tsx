// app/sau/merchandise/[id]/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LABEL_COL = 'min-w-[210px] pr-4 text-sm font-medium text-zinc-700';

type Merch = {
  ItemID: number;
  Title: string;
  Price: number;
  PosterURL?: string | null;
  FrontViewURL?: string | null;
  BackViewURL?: string | null;
  SizeChartURL?: string | null;
  AvailableSizes: string[];
  Options: { caption?: string | null; photoUrl?: string | null }[];
};

export default function MerchEditPage({ params }: { params: { id: string } }) {
  const pathname = usePathname();
  const role = pathname.split('/')[1] === 'auso' ? 'auso' : 'sau';

  const [merch, setMerch] = useState<Merch | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/merchandise/${params.id}`, { cache: 'no-store' });
      const json = await res.json();
      setMerch(json.data || null);
    })();
  }, [params.id]);

  if (!merch) return <div className="p-4">Loading...</div>;

  const selectedSizes = new Set((merch.AvailableSizes ?? []).map((s) => s.toUpperCase()));
  const thumb = (src?: string | null, alt = '—') =>
    src ? <Image src={src} alt={alt} width={110} height={110} className="rounded-md border border-zinc-300 object-cover" /> :
          <div className="flex h-[110px] w-[110px] items-center justify-center rounded-md border border-zinc-300 bg-zinc-100 text-xs text-zinc-500">No image</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Merchandise</h1>

      <div className="space-y-3">
        <Row label="Activity Unit"><div className="py-1">Student Council of Theodore Maria School of Arts</div></Row>
        <Row label="Merchandise Number"><div className="py-1 font-mono">{merch.ItemID}</div></Row>
        <Field label="Merchandise Name" defaultValue={merch.Title} />
        <Field label="Price" defaultValue={String(merch.Price ?? 0)} />

        <Row label="Overview Photo">{thumb(merch.PosterURL, 'Overview')}</Row>
        <Row label="Front View">{thumb(merch.FrontViewURL, 'Front')}</Row>
        <Row label="Back View">{thumb(merch.BackViewURL, 'Back')}</Row>

        <Row label="Size Chart">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {['XXS','XS','S','M','L','XL','2XL','3XL','4XL'].map(s => (
              <label key={s} className="inline-flex items-center gap-2">
                <input type="checkbox" defaultChecked={selectedSizes.has(s)} disabled />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </Row>

        {/* Options */}
        {merch.Options?.map((o, i) => (
          <Row key={i} label={`Option ${i+1}`}>
            <div className="space-y-2">
              <div className="text-sm text-zinc-600">Photo</div>
              {thumb(o.photoUrl, o.caption || `Option ${i+1}`)}
              <div className="text-sm">{o.caption}</div>
            </div>
          </Row>
        ))}

        {/* Buttons */}
        <div className="mt-4 flex items-center gap-3">
          <Link href={`/${role}/merchandise/${merch.ItemID}/pickup`} className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300">Add Pickup</Link>
          <button type="button" onClick={() => alert(`${merch.Title} marked as Sold out (implement PATCH status)`)}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">Sold out</button>
        </div>
      </div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]"><div className={LABEL_COL}>{label}</div><div>{children}</div></div>;
}
function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <Row label={label}>
      <input defaultValue={defaultValue} className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
    </Row>
  );
}
