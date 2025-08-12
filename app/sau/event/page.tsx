'use client';
import GenericTable from '@/components/tables/GenericTable';
import { useJson } from '@/hooks/useJson';
import { Event } from '@/types/db';

export default function SAUEvents() {
  const { data, loading, error } = useJson<{ items: Event[] }>('/api/events');
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;
  return <GenericTable rows={data?.items ?? []} columns={['id','title','date','status']} />;
}
