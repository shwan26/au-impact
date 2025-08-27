import { notFound } from 'next/navigation';
import FundraisingForm from '@/components/forms/FundraisingForm';
import { getFundraisingById } from '@/lib/mock';

export default async function EditFR({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const fr = getFundraisingById(id);
  if (!fr) return notFound();

  return (
    <div>
      <h1>Edit Fundraising</h1>
      <FundraisingForm initial={fr} />
    </div>
  );
}
