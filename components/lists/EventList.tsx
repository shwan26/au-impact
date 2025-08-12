'use client';
import { useJson } from '@/hooks/useJson';
import EventCard from '@/components/cards/EventCard';
import { Event } from '@/types/db';

export default function EventList() {
  const { data, loading, error } = useJson<{ items: Event[] }>('/api/events');
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="card">Error: {error.message}</div>;

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
      {data?.items?.map((e) => <EventCard key={e.id} event={e} />)}
    </div>
  );
}
