// app/sau/merchandise/[id]/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Merch } from '@/types/db';

type Category = 'Clothes' | 'Stationary' | 'Accessory';

const LABEL_COL = 'min-w-[210px] pr-4 text-sm font-medium text-zinc-700';
const ALL_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as const;

export default function SAUMerchEditPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams.id) ? routeParams.id[0] : routeParams.id;

  const [merch, setMerch] = useState<Merch | null>(null);
  const [loading, setLoading] = useState(true);

  // Local-only UI states (not stored in DB yet)
  const [category, setCategory] = useState<Category>('Clothes');
  const [special, setSpecial] = useState<'yes' | 'no'>('no');
  const [opt1Caption, setOpt1Caption] = useState('');
  const [opt2Caption, setOpt2Caption] = useState('');

  // Local file picks for uploads
  const [overviewFile, setOverviewFile] = useState<File | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [opt1File, setOpt1File] = useState<File | null>(null);
  const [opt2File, setOpt2File] = useState<File | null>(null);

  const displayNo = useMemo(
    () => (merch ? `M${String(merch.itemId).padStart(4, '0')}` : ''),
    [merch]
  );

  const isApproved = merch?.status === 'APPROVED';
  const isPending = merch?.status === 'PENDING';
  const isSoldOut = merch?.status === 'SOLD_OUT';

  // Only editable while PENDING
  const isEditable = isPending === true;

  // Category must NOT be editable while pending (and you also said all is read-only when approved)
  const categoryDisabled = isPending || isApproved || isSoldOut;

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/merchandise/${id}`, { cache: 'no-store' });
        const data = res.ok ? await res.json() : null;
        if (alive && data) {
          setMerch(data);
          // If you later persist category/special/options, hydrate them here.
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function handleSave() {
    if (!merch || !isEditable) return;

    const fd = new FormData();
    fd.set('title', merch.title ?? '');
    if (merch.description != null) fd.set('description', merch.description);
    if (merch.contactName != null) fd.set('contactName', merch.contactName);
    if (merch.contactLineId != null) fd.set('contactLineId', merch.contactLineId);
    if (merch.pickupPoint != null) fd.set('pickUpPoint', merch.pickupPoint);
    if (merch.pickupDate != null) fd.set('pickUpDate', merch.pickupDate);
    if (merch.pickupTime != null) fd.set('pickUpTime', merch.pickupTime);
    fd.set('price', String(merch.price ?? 0));

    (merch.availableSizes ?? []).forEach((s) => fd.append('sizes', s as any));

    if (overviewFile) fd.set('overview', overviewFile);
    if (frontFile) fd.set('front', frontFile);
    if (backFile) fd.set('back', backFile);
    if (opt1File) fd.set('option_1_photo', opt1File);
    if (opt1Caption) fd.set('option_1_caption', opt1Caption);
    if (opt2File) fd.set('option_2_photo', opt2File);
    if (opt2Caption) fd.set('option_2_caption', opt2Caption);

    const res = await fetch(`/api/merchandise/${id}`, { method: 'PATCH', body: fd });
    if (!res.ok) {
      const msg = await safeError(res);
      alert(`❌ Failed to save: ${msg}`);
      return;
    }

    const updated = (await res.json()) as Merch;
    setMerch(updated);

    // clear local files after success
    setOverviewFile(null);
    setFrontFile(null);
    setBackFile(null);
    setOpt1File(null);
    setOpt2File(null);

    alert('✅ Saved successfully');
    router.refresh();
  }

  async function handleSoldOut() {
    if (!isApproved) return;
    const res = await fetch(`/api/merchandise/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Status: 'SOLD_OUT' }),
    });
    if (!res.ok) {
      const msg = await safeError(res);
      alert(`❌ Failed to mark sold out: ${msg}`);
      return;
    }
    alert('✅ Marked as sold out');
    router.refresh();
  }

  if (loading) return <div className="p-4">Loading…</div>;
  if (!merch) return <div className="p-4">Not found</div>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Merchandise</h1>

      <div className="mt-4 space-y-4">
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Merchandise Number">
          <div className="py-2 font-mono">{displayNo}</div>
        </Row>

        <Field
          label="Merchandise Name"
          defaultValue={merch.title ?? ''}
          onChange={(val) => isEditable && setMerch((m) => (m ? { ...m, title: val } : m))}
          disabled={!isEditable}
        />

        <Row label="Merchandise Category">
          <select
            className={`w-60 rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${
              categoryDisabled ? 'opacity-50 pointer-events-none' : ''
            }`}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            disabled={categoryDisabled}
          >
            <option>Clothes</option>
            <option>Stationary</option>
            <option>Accessory</option>
          </select>
        </Row>

        <Field
          label="Contact Person"
          defaultValue={merch.contactName ?? ''}
          onChange={(val) =>
            isEditable && setMerch((m) => (m ? { ...m, contactName: val } : m))
          }
          disabled={!isEditable}
        />

        <Field
          label="Contact LineID"
          defaultValue={merch.contactLineId ?? ''}
          onChange={(val) =>
            isEditable && setMerch((m) => (m ? { ...m, contactLineId: val } : m))
          }
          disabled={!isEditable}
        />

        <Field
          label="Price"
          type="number"
          defaultValue={String(merch.price ?? '')}
          onChange={(val) =>
            isEditable && setMerch((m) => (m ? { ...m, price: Number(val || 0) } : m))
          }
          disabled={!isEditable}
        />

        {/* Images */}
        <Row label="Overview Photo">
          <div className="flex items-center gap-4">
            {merch.images?.poster?.url ? (
              <Image
                src={merch.images.poster.url}
                alt={merch.images.poster.alt ?? 'Poster'}
                width={120}
                height={120}
                className="rounded-md border"
              />
            ) : (
              <span className="text-zinc-500">No image</span>
            )}

            <label
              className={`flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200 ${
                !isEditable ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              ＋ Upload .png, .jpg, .jpeg
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => setOverviewFile(e.currentTarget.files?.[0] ?? null)}
              />
            </label>
          </div>
        </Row>

        <Row label="Front View">
          <div className="flex items-center gap-4">
            {merch.images?.frontView?.url ? (
              <Image
                src={merch.images.frontView.url}
                alt="Front"
                width={120}
                height={120}
                className="rounded-md border"
              />
            ) : (
              <span className="text-zinc-500">No image</span>
            )}
            <label
              className={`flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200 ${
                !isEditable ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              ＋ Upload .png, .jpg, .jpeg
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => setFrontFile(e.currentTarget.files?.[0] ?? null)}
              />
            </label>
          </div>
        </Row>

        <Row label="Back View">
          <div className="flex items-center gap-4">
            {merch.images?.backView?.url ? (
              <Image
                src={merch.images.backView.url}
                alt="Back"
                width={120}
                height={120}
                className="rounded-md border"
              />
            ) : (
              <span className="text-zinc-500">No image</span>
            )}
            <label
              className={`flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200 ${
                !isEditable ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              ＋ Upload .png, .jpg, .jpeg
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => setBackFile(e.currentTarget.files?.[0] ?? null)}
              />
            </label>
          </div>
        </Row>

        {/* Size Chart */}
        <Row label="Size Chart">
          <div className="flex flex-wrap gap-4 text-sm">
            {ALL_SIZES.map((s) => {
              const checked = (merch.availableSizes ?? []).includes(s as any);
              return (
                <label key={s} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!checked}
                    disabled={!isEditable}
                    onChange={(e) => {
                      if (!isEditable) return;
                      setMerch((m) => {
                        if (!m) return m;
                        const curr = new Set(m.availableSizes ?? []);
                        if (e.target.checked) curr.add(s as any);
                        else curr.delete(s as any);
                        return { ...m, availableSizes: Array.from(curr) as any };
                      });
                    }}
                  />
                  <span>{s}</span>
                </label>
              );
            })}
          </div>
        </Row>

        {/* Option blocks (UI only) */}
        <div className="space-y-3 rounded-lg border border-zinc-200 p-3">
          <div className="text-sm font-semibold">Option 1</div>
          <Row label="Photo">
            <label
              className={`flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200 ${
                !isEditable ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              ＋ Upload .png, .jpg, .jpeg
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => setOpt1File(e.currentTarget.files?.[0] ?? null)}
              />
            </label>
          </Row>
          <Field
            label="Caption"
            defaultValue={opt1Caption}
            onChange={(v) => isEditable && setOpt1Caption(v)}
            disabled={!isEditable}
          />
        </div>

        <div className="space-y-3 rounded-lg border border-zinc-200 p-3">
          <div className="text-sm font-semibold">Option 2</div>
          <Row label="Photo">
            <label
              className={`flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200 ${
                !isEditable ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              ＋ Upload .png, .jpg, .jpeg
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => setOpt2File(e.currentTarget.files?.[0] ?? null)}
              />
            </label>
          </Row>
          <Field
            label="Caption"
            defaultValue={opt2Caption}
            onChange={(v) => isEditable && setOpt2Caption(v)}
            disabled={!isEditable}
          />
        </div>

        {/* Special Price (UI only) */}
        <Row label="Special Price">
          <div className={`flex items-center gap-6 ${!isEditable ? 'opacity-50' : ''}`}>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="special"
                checked={special === 'yes'}
                onChange={() => isEditable && setSpecial('yes')}
                disabled={!isEditable}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="special"
                checked={special === 'no'}
                onChange={() => isEditable && setSpecial('no')}
                disabled={!isEditable}
              />
              <span>No</span>
            </label>
          </div>
        </Row>

        <Field label="Quality" disabled defaultValue="" />
        <Field label="Percentage" disabled defaultValue="" />

        <Row label="Status">
          <div className="py-2">{merch.status}</div>
        </Row>

        {/* Actions */}
        <div className="mt-2 flex flex-wrap gap-3">
          {isEditable && (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
            >
              Save
            </button>
          )}

          {isApproved && (
            <Link
              href={`/sau/merchandise/${id}/pickup`}
              className="rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
            >
              Add Pickup
            </Link>
          )}

          {isApproved && (
            <button
              type="button"
              onClick={handleSoldOut}
              className="rounded-md bg-red-500 px-6 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Sold out
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */

async function safeError(res: Response) {
  try {
    const j = await res.json();
    return j?.error || res.statusText || 'Unknown error';
  } catch {
    return res.statusText || 'Unknown error';
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className={LABEL_COL}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  onChange,
  type = 'text',
  disabled = false,
}: {
  label: string;
  defaultValue?: string | number;
  onChange?: (val: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <Row label={label}>
      <input
        defaultValue={defaultValue as any}
        type={type}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full max-w-md rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      />
    </Row>
  );
}
