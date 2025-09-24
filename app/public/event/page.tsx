// app/public/event/page.tsx
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/baseUrl';

type ApiEvent = {
  EventID?: string | number | null;
  Title?: string | null;
  Description?: string | null;
  StartDateTime?: string | null;
  EndDateTime?: string | null;
  Venue?: string | null;
  PosterURL?: string | null;
  Status?: string | null;
  // possible variants
  eventid?: string | number | null;
  title?: string | null;
  description?: string | null;
  startdate?: string | null;
  enddate?: string | null;
  venue?: string | null;
  photourl?: string | null;
  posterurl?: string | null;
  photo_url?: string | null;
  status?: string | null;
};

function normalize(e: ApiEvent) {
  const id = e.EventID ?? e.eventid ?? null;
  const poster = e.PosterURL ?? e.posterurl ?? e.photourl ?? e.photo_url ?? null;
  return {
    id: id != null ? String(id) : '',
    title: (e.Title ?? e.title ?? 'Untitled Event') || 'Untitled Event',
    description: e.Description ?? e.description ?? null,
    start: e.StartDateTime ?? e.startdate ?? null,
    end: e.EndDateTime ?? e.enddate ?? null,
    venue: e.Venue ?? e.venue ?? null,
    poster,
    status: String(e.Status ?? e.status ?? '').toUpperCase(),
  };
}

export default async function EventPage() {
  noStore();

  const base = getBaseUrl();
  // Public should show LIVE events
  const url = `${base}/api/events?status=LIVE`;

  let items: ReturnType<typeof normalize>[] = [];
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      const json = text ? JSON.parse(text) : { items: [] };
      const raw: ApiEvent[] = Array.isArray(json.items) ? json.items : [];
      items = raw.map(normalize).filter((e) => !!e.id);
    } else {
      console.error('Failed to load events:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Error fetching events:', err);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">Events</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => {
          const start = e.start ? (() => {
            const d = new Date(e.start);
            return isNaN(d.getTime()) ? undefined : d.toLocaleString();
          })() : undefined;

          const end = e.end ? (() => {
            const d = new Date(e.end);
            return isNaN(d.getTime()) ? undefined : d.toLocaleString();
          })() : undefined;

          return (
            <article key={e.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="aspect-[16/9] bg-zinc-100">
                {e.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.poster} alt={e.title} loading="lazy" className="h-full w-full object-cover" />
                ) : null}
              </div>

              <div className="p-4">
                <h3 className="line-clamp-2 text-base font-semibold">
                  <Link href={`/public/event/${e.id}`} className="hover:underline">
                    {e.title}
                  </Link>
                </h3>

                {(start || end) && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {start}{end ? ` — ${end}` : ''}
                  </p>
                )}

                {e.venue && <p className="mt-1 text-xs text-zinc-500">Venue: {e.venue}</p>}

                {e.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-700">{e.description}</p>
                )}
              </div>
            </article>
          );
        })}

        {!items.length && (
          <div className="col-span-full rounded-lg border border-zinc-200 p-6 text-center text-zinc-600">
            No events found.
          </div>
        )}
      </div>
    </div>
  );
}
