'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import Pager from '@/components/ui/Pager';
import { useCart } from '@/hooks/useCart';
import { useJson } from '@/hooks/useJson';
import type { Merch } from '@/types/db';

const MerchandiseList = dynamic(
  () => import('@/components/lists/MerchandiseList'),
  { ssr: false }
);

const PAGE_SIZE = 12;

// Treat an item as "approved" if it either has approved === true or status === 'approved'
const isApproved = (m: Merch) => {
  // @ts-expect-error — support both shapes without changing the Merch type now
  if (typeof m.approved !== 'undefined') return Boolean((m as any).approved);
  return (m as any).status === 'APPROVED';
};

export default function Page() {
  const sp = useSearchParams();
  const pageParam = sp.get('page');
  const q = (sp.get('q') || '').trim().toLowerCase();
  const page = Math.max(Number.parseInt(pageParam ?? '1', 10) || 1, 1);

  // cart count (sum of quantities)
  const { items } = useCart();
  const cartCount = useMemo(
    () => items.reduce((sum, it) => sum + (it.qty ?? 1), 0),
    [items]
  );

  // ✅ fetch from API (could also pass a hint like ?status=approved if your API supports it)
  const { data, loading, error } = useJson<{ items: Merch[] }>(
    '/api/merchandise'
    // e.g. '/api/merchandise?status=approved'
  );
  const allMerches = data?.items ?? [];

  // keep only approved for public
  const approvedOnly = useMemo(() => allMerches.filter(isApproved), [allMerches]);

  // search (optional) within approved
  const filtered = useMemo(() => {
    if (!q) return approvedOnly;
    return approvedOnly.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [q, approvedOnly]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const clamped = Math.min(page, totalPages);
  const start = (clamped - 1) * PAGE_SIZE;
  const itemsPage = filtered.slice(start, start + PAGE_SIZE);

  if (loading && !data) {
    return <div className="p-4">Loading merchandise…</div>;
  }

  return (
    <main className="mx-auto max-w-[1200px] px-3 py-4">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Merchandise</h1>

        {/* simple search UI via querystring ?q= */}
        <form method="get" action="/public/merchandise" className="ml-auto">
          <input
            name="q"
            defaultValue={q}
            placeholder="search"
            className="w-[210px] rounded-full border border-gray-300 px-3 py-1 outline-none"
          />
        </form>

        <Link
          href="/public/merchandise/cart"
          aria-label={`Cart with ${cartCount} item(s)`}
        >
          🛒 ({cartCount})
        </Link>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
          Couldn’t load merchandise. Please try again later.
        </div>
      )}

      {!error && itemsPage.length === 0 && (
        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm">
          No approved merchandise found{q ? ` for “${q}”` : ''}.
        </div>
      )}

      <MerchandiseList items={itemsPage} />

      <div className="mt-6">
        <Pager
          page={clamped}
          totalPages={totalPages}
          basePath={`/public/merchandise${q ? `?q=${encodeURIComponent(q)}&` : ''}`}
        />
      </div>
    </main>
  );
}
