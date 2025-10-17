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

type MerchColor = {
  merchId: string | number | null;
  name: string | null;
  photoUrl: string | null;
  // Prefer using a stable id if your API returns one
  id?: string | number | null;
};

export default function SAUMerchEditPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams.id) ? routeParams.id[0] : routeParams.id;

  const [merch, setMerch] = useState<Merch | null>(null);
  const [loading, setLoading] = useState(true);

  // Colors (editable)
  const [colors, setColors] = useState<MerchColor[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [colorErr, setColorErr] = useState<string | null>(null);

  // Add color form state
  const [newColorName, setNewColorName] = useState('');
  const [newColorFile, setNewColorFile] = useState<File | null>(null);
  const [addingColor, setAddingColor] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);

  // Local-only UI states (not stored in DB yet)
  const [category, setCategory] = useState<Category>('Clothes');
  const [special, setSpecial] = useState<'yes' | 'no'>('no');

  // Local file picks for uploads
  const [overviewFile, setOverviewFile] = useState<File | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const displayNo = useMemo(
    () => (merch ? `M${String((merch as any).itemId ?? merch.id ?? '').padStart(4, '0')}` : ''),
    [merch]
  );

  const isApproved = merch?.status === 'APPROVED';
  const isPending = merch?.status === 'PENDING';
  const isSoldOut = merch?.status === 'SOLD_OUT';

  // Only editable while PENDING
  const isEditable = isPending === true;

  // Category must NOT be editable while pending (and all is read-only when approved/sold-out)
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
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // Fetch colors
  async function refreshColors() {
    if (!id) return;
    setLoadingColors(true);
    setColorErr(null);
    try {
      const res = await fetch(`/api/merchandise/${id}/colors`, { cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load colors');
      const data = (await res.json()) as MerchColor[];
      setColors(data ?? []);
    } catch (e: any) {
      setColorErr(e?.message || 'Failed to load colors');
    } finally {
      setLoadingColors(false);
    }
  }

  useEffect(() => {
    refreshColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddColor() {
    if (!isEditable) return;
    if (!newColorName.trim()) {
      alert('Please enter a color name.');
      return;
    }
    if (!newColorFile) {
      alert('Please choose a color image (.png/.jpg/.jpeg).');
      return;
    }

    try {
      setAddingColor(true);
      const fd = new FormData();
      // Adjust keys if your API expects different field names
      fd.set('name', newColorName.trim());
      fd.set('photo', newColorFile);

      const res = await fetch(`/api/merchandise/${id}/colors`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const msg = await safeError(res);
        throw new Error(msg);
      }

      setNewColorName('');
      setNewColorFile(null);
      await refreshColors();
      alert('✅ Color added');
    } catch (e: any) {
      alert(`❌ Failed to add color: ${e?.message || 'Unknown error'}`);
    } finally {
      setAddingColor(false);
    }
  }

  async function handleDeleteColor(name: string) {
    if (!isEditable) return;
    const confirmMsg = `Delete color "${name}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingName(name);
      const res = await fetch(`/api/merchandise/${id}/colors`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const msg = await safeError(res);
        throw new Error(msg);
      }
      await refreshColors();
      alert('🗑️ Color deleted');
    } catch (e: any) {
      alert(`❌ Failed to delete: ${e?.message || 'Unknown error'}`);
    } finally {
      setDeletingName(null);
    }
  }

  async function handleSave() {
    if (!merch || !isEditable) return;

    const fd = new FormData();
    fd.set('title', merch.title ?? '');
    if ((merch as any).description != null) fd.set('description', (merch as any).description);
    if ((merch as any).contactName != null) fd.set('contactName', (merch as any).contactName);
    if ((merch as any).contactLineId != null) fd.set('contactLineId', (merch as any).contactLineId);
    if ((merch as any).pickupPoint != null) fd.set('pickUpPoint', (merch as any).pickupPoint);
    if ((merch as any).pickupDate != null) fd.set('pickUpDate', (merch as any).pickupDate);
    if ((merch as any).pickupTime != null) fd.set('pickUpTime', (merch as any).pickupTime);
    fd.set('price', String(merch.price ?? 0));

    (merch.availableSizes ?? []).forEach((s) => fd.append('sizes', s as any));

    if (overviewFile) fd.set('overview', overviewFile);
    if (frontFile) fd.set('front', frontFile);
    if (backFile) fd.set('back', backFile);

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
          defaultValue={(merch as any).contactName ?? ''}
          onChange={(val) =>
            isEditable && setMerch((m) => (m ? { ...m, contactName: val } as any : m))
          }
          disabled={!isEditable}
        />

        <Field
          label="Contact LineID"
          defaultValue={(merch as any).contactLineId ?? ''}
          onChange={(val) =>
            isEditable && setMerch((m) => (m ? { ...m, contactLineId: val } as any : m))
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
            {(merch as any).images?.poster?.url ? (
              <Image
                src={(merch as any).images.poster.url}
                alt={(merch as any).images.poster.alt ?? 'Poster'}
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
            {(merch as any).images?.frontView?.url ? (
              <Image
                src={(merch as any).images.frontView.url}
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
            {(merch as any).images?.backView?.url ? (
              <Image
                src={(merch as any).images.backView.url}
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

        {/* Colors (add/delete) */}
        <Row label="Colors">
          <div className="w-full">
            {loadingColors && <div className="py-2 text-sm text-zinc-500">Loading colors…</div>}
            {colorErr && <div className="py-2 text-sm text-red-600">{colorErr}</div>}

            {/* Existing colors */}
            {!loadingColors && !colorErr && (
              <>
                {colors.length === 0 ? (
                  <div className="py-2 text-sm text-zinc-500">No colors</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {colors.map((c, i) => (
                      <div key={`${c.id ?? c.merchId}-${c.name}-${i}`} className="rounded-lg border p-3 text-sm">
                        <div className="mb-2 h-24 w-full overflow-hidden rounded-md border bg-white">
                          {c.photoUrl ? (
                            <Image
                              src={c.photoUrl}
                              alt={c.name ?? 'Color'}
                              width={200}
                              height={120}
                              className="h-24 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-zinc-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="truncate font-medium">{c.name || 'Unnamed color'}</div>

                        {/* Delete button (only when editable) */}
                        {isEditable && c.name && (
                          <button
                            type="button"
                            onClick={() => handleDeleteColor(c.name as string)}
                            disabled={deletingName === c.name}
                            className={`mt-2 w-full rounded-md px-3 py-1 text-sm ${
                              deletingName === c.name
                                ? 'bg-zinc-200 text-zinc-500'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                          >
                            {deletingName === c.name ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Add new color (only when editable) */}
            {isEditable && (
              <div className="mt-4 rounded-lg border border-zinc-200 p-3">
                <div className="mb-2 text-sm font-semibold">Add Color</div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[210px_1fr]">
                  <div className={LABEL_COL}>Color Name</div>
                  <div>
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="w-full max-w-md rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                      placeholder="e.g., Black"
                    />
                  </div>

                  <div className={LABEL_COL}>Color Photo</div>
                  <div>
                    <label className="flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200">
                      ＋ Upload .png, .jpg, .jpeg
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={(e) => setNewColorFile(e.currentTarget.files?.[0] ?? null)}
                      />
                    </label>
                    {newColorFile && (
                      <div className="mt-2 text-xs text-zinc-600">
                        Selected: <span className="font-medium">{newColorFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleAddColor}
                    disabled={addingColor}
                    className={`rounded-md px-4 py-2 text-sm ${
                      addingColor ? 'bg-zinc-200 text-zinc-500' : 'bg-zinc-800 text-white hover:bg-zinc-900'
                    }`}
                  >
                    {addingColor ? 'Adding…' : 'Add Color'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Row>

        {/* Special Price (UI only placeholder – kept as in your file) */}
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
