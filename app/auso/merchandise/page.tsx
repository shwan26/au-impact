'use client';
import GenericTable from '@/components/tables/GenericTable';
import { useJson } from '@/hooks/useJson';
import { Product } from '@/types/db';

export default function AUSOMerch() {
  const { data, loading, error } = useJson<{ items: Product[] }>('/api/merchandise');
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;
  return <GenericTable rows={data?.items ?? []} columns={['id','title','price','status']} />;
}
