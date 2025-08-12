import { notFound } from 'next/navigation';
import { getAnnouncementById } from '@/lib/mock';

export default async function AnnouncementDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = getAnnouncementById(id);
  if (!a) return notFound();

  return (
    <div className="grid">
      <h1>{a.title}</h1>
      <p>{a.body}</p>
    </div>
  );
}
