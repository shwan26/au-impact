'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Pager from '@/components/ui/Pager';
import { merches } from '@/lib/mock';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart'; // 👈 add

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

  // ✅ cart count (sum of quantities)
  const { items } = useCart();
  const cartCount = useMemo(
    () => items.reduce((sum, it) => sum + (it.qty ?? 1), 0),
    [items]
  );

  // filter (optional)
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
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 10px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Merchandise</h1>

        {/* simple search UI via querystring ?q= */}
        <form method="get" action="/public/merchandise" style={{ marginLeft: 'auto' }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="search"
            style={{
              width: 210,
              border: '1px solid #ddd',
              borderRadius: 999,
              padding: '6px 12px',
              outline: 'none',
            }}
          />
        </form>

        <Link href="/public/merchandise/cart" aria-label={`Cart with ${cartCount} item(s)`}>
          🛒 ({cartCount})
        </Link>
      </div>

      <MerchandiseList items={itemsPage} />

      <div style={{ marginTop: 24 }}>
        <Pager
          page={clamped}
          totalPages={totalPages}
          basePath={`/public/merchandise${q ? `?q=${encodeURIComponent(q)}&` : ''}`}
        />
      </div>
    </main>
  );
}
