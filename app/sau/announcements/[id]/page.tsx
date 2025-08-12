import { notFound } from 'next/navigation';
import AnnouncementForm from '@/components/forms/AnnouncementForm';
import { getAnnouncementById } from '@/lib/mock';

export default async function EditAn({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = getAnnouncementById(id);
  if (!a) return notFound();

  return (
    <div>
      <h1>Edit Announcement</h1>
      <AnnouncementForm initial={a} />
    </div>
  );
}
