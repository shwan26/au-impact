'use client';
import GenericTable from '@/components/tables/GenericTable';
import { useJson } from '@/hooks/useJson';
import { Fundraising } from '@/types/db';

export default function AUSOFR() {
  const { data, loading, error } = useJson<{ items: Fundraising[] }>('/api/fundraising');
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;
  return <GenericTable rows={data?.items ?? []} columns={['id','title','goal','status']} />;
}
