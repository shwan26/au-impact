// app/public/event/[id]/loading.tsx
import CardSkeleton from '@/components/skeletons/CardSkeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <CardSkeleton />
    </div>
  );
}
