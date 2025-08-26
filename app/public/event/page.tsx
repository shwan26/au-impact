// app/public/event/page.tsx
import EventList from '@/components/lists/EventList';

export default function EventPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">Events</h1>
      <EventList />
    </div>
  );
}
