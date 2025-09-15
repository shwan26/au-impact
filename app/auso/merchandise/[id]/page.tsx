// app/auso/merchandise/[id]/page.tsx
'use client';

import Image from 'next/image';
import { getMerchById } from '@/lib/mock';
import type { Merch } from '@/types/db';

const LABEL_COL = 'min-w-[210px] pr-4 text-sm font-medium text-zinc-700';

export default function MerchEditPage({ params }: { params: { id: string } }) {
  const merch = getMerchById(params.id) as Merch | undefined;
  if (!merch) return <div className="p-4">Merchandise not found.</div>;

  const selectedSizes = new Set((merch.availableSizes ?? []).map((s) => s.toUpperCase()));

  const approve = () => alert('Approved (demo)');
  const reject = () => alert('Marked as Not approved (demo)');
  const save = () => alert('Saved changes (demo)');

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Merchandise</h1>

      <div className="space-y-3">
        <Row label="Activity Unit">
          <div className="py-1">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Merchandise Number">
          <div className="py-1 font-mono">{merch.itemId}</div>
        </Row>

        <Field label="Merchandise Name" defaultValue={merch.title} />

        <Row label="Merchandise Category">
          <select
            defaultValue="Clothes"
            className="w-56 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          >
            <option>Clothes</option>
            <option>Stationary</option>
            <option>Accessory</option>
          </select>
        </Row>

        <Field label="Contact Person" defaultValue={merch.contactName ?? 'Johnson'} />
        <Field label="Contact LineID" defaultValue={merch.contactLineId ?? '@john33'} />
        <Field label="Price" defaultValue={(merch.price ?? 0).toString() + ' THB'} />

        <Row label="Overview Photo">
          <Thumb src={merch.images?.poster?.url} alt={merch.images?.poster?.alt ?? 'Overview'} />
        </Row>

        <Row label="Front View">
          <Thumb src={merch.images?.frontView?.url} alt={merch.images?.frontView?.alt ?? 'Front'} />
        </Row>

        <Row label="Back View">
          <Thumb src={merch.images?.frontView?.url} alt="Back View" />
        </Row>

        <Row label="Size Chart">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map((s) => (
              <label key={s} className="inline-flex items-center gap-2">
                <input type="checkbox" defaultChecked={selectedSizes.has(s)} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </Row>

        {/* Option 1 */}
        <Row label="Option 1">
          <div className="space-y-2">
            <div className="text-sm text-zinc-600">Photo</div>
            <Thumb
              src={merch.images?.misc?.[0]?.url ?? merch.images?.poster?.url}
              alt={merch.images?.misc?.[0]?.alt ?? 'Option 1'}
            />
          </div>
        </Row>
        <Field label="Caption" defaultValue="White" />

        {/* Option 2 */}
        <Row label="Option 2">
          <div className="space-y-2">
            <div className="text-sm text-zinc-600">Photo</div>
            <Thumb
              src={merch.images?.misc?.[0]?.url ?? merch.images?.poster?.url}
              alt="Option 2"
            />
          </div>
        </Row>
        <Field label="Caption" defaultValue="Black" />

        <Row label="Special Price">
          <div className="flex items-center gap-6 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="special" />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="special" defaultChecked />
              <span>No</span>
            </label>
          </div>
        </Row>

        <Field label="Quality" />
        <Field label="Percentage" />

       {/* Status (Approve / Not approve) */}
<Row label="Status">
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={approve}
      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/30"
    >
      Approve
    </button>
    <button
      type="button"
      onClick={reject}
      className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
    >
      Not approve
    </button>
  </div>
</Row>


        {/* Bottom: Save only */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
          >
            Save
          </button>
        </div>
      </div>
    </main>
  );
}

/* — helpers — */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className={LABEL_COL}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <Row label={label}>
      <input
        defaultValue={defaultValue}
        className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </Row>
  );
}

function Thumb({ src, alt }: { src?: string; alt: string }) {
  const w = 110;
  const h = 110;
  if (!src) {
    return (
      <div className="flex h-[110px] w-[110px] items-center justify-center rounded-md border border-zinc-300 bg-zinc-100 text-xs text-zinc-500">
        No image
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      className="rounded-md border border-zinc-300 object-cover"
    />
  );
}
