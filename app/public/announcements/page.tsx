import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';

/** ---------- Inline List Component (no separate import needed) ---------- */
type AnnouncementListItem = {
  id: string;
  topic: string;
  description?: string;
  datePosted?: string;
  status?: string;
  photoUrl?: string;
};

function AnnouncementList({ items }: { items: AnnouncementListItem[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6 text-zinc-600">
        No announcements found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => (
        <article key={a.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {/* Image */}
          <div className="aspect-[16/9] bg-zinc-100">
            {a.photoUrl ? (
              <img src={a.photoUrl} alt={a.topic} className="h-full w-full object-cover" />
            ) : null}
          </div>

          {/* Body */}
          <div className="p-4">
            <h3 className="line-clamp-2 text-base font-semibold">
              <Link href={`/public/announcements/${a.id}`} className="hover:underline">
                {a.topic}
              </Link>
            </h3>

            {a.datePosted && <p className="mt-1 text-xs text-zinc-500">{a.datePosted}</p>}

            {a.description && (
              <p className="mt-2 line-clamp-3 text-sm text-zinc-700">{a.description}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
/** ---------------------------------------------------------------------- */

/** Build absolute URL (works locally + Vercel) */
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
      const json = await res.json();
      items = (json.items ?? []).map((r: any) => ({
        id: String(r.AnnouncementID),
        topic: r.Topic,
        description: r.Description ?? undefined,
        datePosted: r.DatePosted ? new Date(r.DatePosted).toLocaleDateString() : undefined,
        status: r.Status,
        photoUrl: r.PhotoURL ?? undefined,
      }));
    }
  } catch (err) {
    console.error('Error fetching announcements:', err);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-extrabold">Announcements</h1>
      <AnnouncementList items={items} />
    </main>
  );
}
