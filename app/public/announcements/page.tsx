/* eslint-disable @next/next/no-img-element */
type ApiItem = {
  AnnouncementID: number;
  Topic: string;
  Description: string | null;
  PhotoURL: string | null;
  DatePosted: string | null;
  Status: 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;
};

import { unstable_noStore as noStore } from 'next/cache';
import AnnouncementList, { type AnnouncementListItem } from './AnnouncementList';

type ApiItem = {
  AnnouncementID: number;
  Topic: string;
  Description: string | null;
  PhotoURL: string | null;
  DatePosted: string | null;
  Status: 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  return 'http://localhost:3000';
}

export default async function PublicAnnouncementsPage() {
  noStore();

  const base = getBaseUrl();
  const url = `${base}/api/announcements?status=LIVE`;

  let items: AnnouncementListItem[] = [];
  try {
    const res = await fetch(url, { cache: 'no-store', next: { revalidate: 0 } });
    if (res.ok) {
      const json = (await res.json()) as { items?: ApiItem[] };
      items = (json.items ?? []).map((r) => ({
        id: String(r.AnnouncementID),
        topic: r.Topic,
        description: r.Description ?? undefined,
        datePosted: r.DatePosted ? new Date(r.DatePosted).toLocaleDateString() : undefined,
        status: r.Status,
        photoUrl: r.PhotoURL ?? undefined,
      }));
    }
  } catch {
    // swallow for public page
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-extrabold">Announcements</h1>
      <AnnouncementList items={items} />
    </main>
  );
}
