import ListSkeleton from '@/components/skeletons/ListSkeleton';

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading events">
      <ListSkeleton />
    </div>
  );
}
