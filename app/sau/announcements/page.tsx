'use client';
import GenericTable from '@/components/tables/GenericTable';
import { useJson } from '@/hooks/useJson';
import { Announcement } from '@/types/db';

export default function SAUAn() {
  const { data, loading, error } = useJson<{ items: Announcement[] }>('/api/announcements');
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;
  return <GenericTable rows={data?.items ?? []} columns={['id','title','createdAt','status']} />;
}
