'use client';

import type { Merch } from '@/types/db';
import MerchandiseCard from '@/components/cards/MerchandiseCard';

export default function MerchandiseList({ items }: { items: Merch[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '24px',
        justifyItems: 'center',
        alignItems: 'start',
      }}
    >
      {items.map((p) => (
        <MerchandiseCard key={p.itemId} p={p} />
      ))}
    </div>
  );
}
