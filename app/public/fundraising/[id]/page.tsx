import { notFound } from 'next/navigation';
import { getFundraisingById } from '@/lib/mock';

export default async function FRDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fr = getFundraisingById(id);
  if (!fr) return notFound();

  return (
    <div className="grid">
      <h1>{fr.title}</h1>
      <p>{fr.description}</p>
      <div className="badge">Goal: {fr.goal}</div>
    </div>
  );
}
