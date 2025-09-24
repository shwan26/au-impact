// app/public/merchandise/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import Pager from '@/components/ui/Pager';
import { merches } from '@/lib/mock';
import { useCart } from '@/hooks/useCart';

const MerchandiseList = dynamic(
  () => import('@/components/lists/MerchandiseList'),
  { ssr: false }
);

const PAGE_SIZE = 12;

export default function Page() {
  const sp = useSearchParams();
  const pageParam = sp.get('page');
  const q = (sp.get('q') || '').trim().toLowerCase();
  const page = Math.max(Number.parseInt(pageParam ?? '1', 10) || 1, 1);

  const { items } = useCart();
  const cartCount = useMemo(
    () => items.reduce((sum, it) => sum + (it.qty ?? 1), 0),
    [items]
  );

  const filtered = useMemo(() => {
    if (!q) return merches;
    return merches.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [q]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const clamped = Math.min(page, totalPages);
  const start = (clamped - 1) * PAGE_SIZE;
  const itemsPage = filtered.slice(start, start + PAGE_SIZE);

  return (
    <main className="mx-auto max-w-[1200px] px-3 py-4">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Merchandise</h1>

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
