'use client';
import { useJson } from '@/hooks/useJson';
import FundraisingCard from '@/components/cards/FundraisingCard';
import { Fundraising } from '@/types/db';

export default function FundraisingList() {
  const { data, loading, error } = useJson<{ items: Fundraising[] }>('/api/fundraising');
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
      {data?.items?.map((i) => <FundraisingCard key={i.id} item={i} />)}
    </div>
  );
}
