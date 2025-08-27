import { notFound } from 'next/navigation';
import EventForm from '@/components/forms/EventForm';
import { getEventById } from '@/lib/mock';

export default async function EditEvent({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const event = getEventById(id);
  if (!event) return notFound();

  return (
    <div>
      <h1>Edit Event</h1>
      <EventForm initial={event} />
    </div>
  );
}
