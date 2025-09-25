// app/public/fundraising/loading.tsx
import ListSkeleton from '@/components/skeletons/ListSkeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-zinc-800">Fundraising</h1>
      <p className="text-sm text-zinc-500">Loading fundraising projects…</p>
      <ListSkeleton />
    </div>
  );
}
