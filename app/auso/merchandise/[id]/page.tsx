'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Merch } from '@/types/db';

const LABEL_COL = 'min-w-[210px] pr-4 text-sm font-medium text-zinc-700';

export default function AUSOMerchReadonlyModerationPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams.id) ? routeParams.id[0] : routeParams.id;

  const [merch, setMerch] = useState<Merch | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'APPROVE' | 'PENDING' | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const displayNo = useMemo(
    () => (merch ? `M${String(merch.itemId).padStart(4, '0')}` : ''),
    [merch]
  );

  const isApproved = merch?.status === 'APPROVED';
  const isPending = merch?.status === 'PENDING';
  const isSoldOut = merch?.status === 'SOLD_OUT';

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/merchandise/${id}`, { cache: 'no-store' });
        const data = res.ok ? await res.json() : null;
        if (alive) setMerch(data);
      } catch (e) {
        if (alive) setErrMsg('Failed to load merchandise.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function updateStatus(next: 'APPROVED' | 'PENDING') {
    if (!id) return;
    try {
      setBusy(next);
      setErrMsg(null);
      // Using "Status" (capital S) to match your existing SAU PATCH payload
      const res = await fetch(`/api/merchandise/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: next }),
      });
      if (!res.ok) {
        const msg = await safeError(res);
        throw new Error(msg || 'Failed to update status');
      }
      const updated = (await res.json()) as Merch;
      setMerch(updated);
      router.refresh();
    } catch (e: any) {
      setErrMsg(e?.message || 'Failed to update status');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <div className="p-4">Loading…</div>;
  if (!merch) return <div className="p-4">Merchandise not found.</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Merchandise (AUSO)</h1>
        <Link
          href="/auso/merchandise"
          className="text-sm underline underline-offset-4 hover:no-underline"
        >
          ← Back to list
        </Link>
      </div>

      {errMsg && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errMsg}
        </div>
      )}

      <div className="space-y-3">
        <Row label="Activity Unit">
          <div className="py-2">Assumption University Student Organization (AUSO)</div>
        </Row>

        <Row label="Merchandise Number">
          <div className="py-2 font-mono">{displayNo}</div>
        </Row>

        <Row label="Merchandise Name">
          <div className="py-2">{merch.title ?? <span className="text-zinc-500">—</span>}</div>
        </Row>

        <Row label="Contact Person">
          <div className="py-2">{merch.contactName ?? <span className="text-zinc-500">—</span>}</div>
        </Row>

        <Row label="Contact LineID">
          <div className="py-2">{merch.contactLineId ?? <span className="text-zinc-500">—</span>}</div>
        </Row>

        <Row label="Price">
          <div className="py-2">{merch.price != null ? `${merch.price}` : <span className="text-zinc-500">—</span>}</div>
        </Row>

        {/* Images */}
        <Row label="Overview Photo">
          <ImageOrNone src={merch.images?.poster?.url} alt={merch.images?.poster?.alt ?? 'Poster'} />
        </Row>
        <Row label="Front View">
          <ImageOrNone src={merch.images?.frontView?.url} alt="Front" />
        </Row>
        <Row label="Back View">
          <ImageOrNone src={merch.images?.backView?.url} alt="Back" />
        </Row>

        {/* Sizes (read-only) */}
        <Row label="Sizes">
          <div className="flex flex-wrap gap-2">
            {(merch.availableSizes ?? []).length ? (
              (merch.availableSizes ?? []).map((s) => (
                <span
                  key={s as any}
                  className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs"
                >
                  {s as any}
                </span>
              ))
            ) : (
              <span className="text-zinc-500">—</span>
            )}
          </div>
        </Row>

        <Row label="Status">
          <div className="py-2">{merch.status}</div>
        </Row>

        {/* Moderation actions */}
        <div className="mt-3 flex flex-wrap gap-3">
          {!isApproved && (
            <button
              type="button"
              onClick={() => updateStatus('APPROVED')}
              disabled={busy !== null}
              className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy === 'APPROVED' ? 'Approving…' : 'Approve'}
            </button>
          )}

          {/* "Not Approve" sends the item back to PENDING */}
          {!isPending && (
            <button
              type="button"
              onClick={() => updateStatus('PENDING')}
              disabled={busy !== null}
              className="rounded-md bg-rose-600 px-6 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {busy === 'PENDING' ? 'Not Approving…' : 'Not Approve'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */

function ImageOrNone({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return <span className="text-zinc-500">No image</span>;
  return (
    <Image
      src={src}
      alt={alt || 'Image'}
      width={120}
      height={120}
      className="rounded-md border"
    />
  );
}

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
