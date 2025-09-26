// app/public/fundraising/page.tsx
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

type Item = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  goal: number | null;
  status: string;
};

// Resolve an absolute base URL without touching request headers
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
}

export default async function PublicFundraisingPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  noStore(); // disable caching for fresh data
  const q = (searchParams?.q ?? '').trim();

  const base = getBaseUrl();
  const url = new URL(`${base}/api/fundraising`);
  url.searchParams.set('status', 'LIVE');
  if (q) url.searchParams.set('q', q);

  let items: Item[] = [];
  try {
    const res = await fetch(String(url), { cache: 'no-store', next: { revalidate: 0 } });
    if (res.ok) {
      const json = (await res.json()) as { items: Item[]; total?: number };
      items = json.items ?? [];
    }
  } catch {
    // ignore; fallback to empty list below
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-extrabold">Fundraising</h1>

        <form method="GET" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search project name…"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-300">
            Search
          </button>
          {q && (
            <a
              href="/public/fundraising"
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <Link
            key={f.id}
            href={`/public/fundraising/${f.id}`}
            className="block rounded-xl border border-zinc-200 bg-white p-4 hover:shadow"
          >
            {f.imageUrl ? (
              <img
                src={f.imageUrl}
                alt={f.title}
                className="mb-3 h-40 w-full rounded-md object-cover"
              />
            ) : (
              <div className="mb-3 h-40 w-full rounded-md bg-zinc-100" />
            )}
            <div className="font-semibold">{f.title}</div>
            {f.goal != null && (
              <div className="text-sm text-zinc-600">
                Goal: {f.goal.toLocaleString('en-US')} THB
              </div>
            )}
          </Link>
        ))}

        {!items.length && (
          <div className="col-span-full rounded-md border border-zinc-200 p-6 text-center text-zinc-600">
            {q ? `No projects match “${q}”.` : 'No fundraising projects found.'}
          </div>
        )}
      </div>
    </main>
  );
}
