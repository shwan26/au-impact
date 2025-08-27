// components/lists/FundraisingList.tsx
'use client';

import { useMemo, useState } from 'react';
import { fundraising } from '@/lib/mock';
import type { Fundraising } from '@/types/db';
import FundraisingCard from '@/components/cards/FundraisingCard';

export default function FundraisingList() {
  const [q, setQ] = useState('');
  const all: Fundraising[] = fundraising();

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? all.filter((f) => f.title.toLowerCase().includes(t)) : all;
  }, [all, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Fundraising</h1>
        <input
          placeholder="search"
          className="w-44 rounded-full border border-zinc-300 px-4 py-1 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setQ((v) => v)}
        />
      </div>

      <div className="space-y-10">
        {filtered.map((item) => (
          <FundraisingCard key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-zinc-600">
            No campaigns found.
          </div>
        )}
      </div>
    </div>
  );
}