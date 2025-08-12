import Link from 'next/link';
import { Event } from '@/types/db';

export default function EventCard({ event }: { event: Event }){
  return (
    <div className="card">
      <h3><Link href={`/public/event/${event.id}`}>{event.title}</Link></h3>
      <div className="badge">{new Date(event.date).toLocaleDateString()}</div>
      <p>{event.summary}</p>
    </div>
  );
}