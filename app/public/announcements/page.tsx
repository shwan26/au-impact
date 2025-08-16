'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Pager from '@/components/ui/Pager';
import { announcements } from '@/lib/mock';

const AnnouncementList = dynamic(
  () => import('@/components/lists/AnnouncementList'),
  { ssr: false }
);

const PAGE_SIZE = 9;

export default function Page() {
  const sp = useSearchParams();
  const pageParam = sp.get('page');
  const page = Math.max(Number.parseInt(pageParam ?? '1', 10) || 1, 1);

  // Make sure this matches your mock data ('live' not 'LIVE')
  const live = announcements().filter((a) => a.status === 'LIVE');

  const totalPages = Math.max(Math.ceil(live.length / PAGE_SIZE), 1);
  const clamped = Math.min(page, totalPages);
  const start = (clamped - 1) * PAGE_SIZE;
  const items = live.slice(start, start + PAGE_SIZE);

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 10px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
        Announcements
      </h1>

      <AnnouncementList items={items} />

      <Pager
        page={clamped}
        totalPages={totalPages}
        basePath="/public/announcements"
      />
    </main>
  );
}
