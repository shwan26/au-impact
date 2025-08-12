import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/mock';

export default async function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) return notFound();

  return (
    <div className="grid">
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <div className="badge">{new Date(event.date).toLocaleDateString()}</div>
    </div>
  );
}
