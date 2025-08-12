'use client';
import { useJson } from '@/hooks/useJson';
import Link from 'next/link';
import { Announcement } from '@/types/db';

export default function AnnouncementList() {
  const { data, loading, error } = useJson<{ items: Announcement[] }>('/api/announcements');
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;

  return (
    <ul>
      {data?.items?.map((a) => (
        <li key={a.id} className="card">
          <Link href={`/public/announcements/${a.id}`}>{a.title}</Link>
        </li>
      ))}
    </ul>
  );
}
