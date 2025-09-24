// app/public/merchandise/loading.tsx
import ListSkeleton from '@/components/skeletons/ListSkeleton';

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1200px] px-3 py-4">
      <ListSkeleton />
    </main>
  );
}
