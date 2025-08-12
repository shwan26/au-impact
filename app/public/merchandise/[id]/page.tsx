import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/mock';

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getProductById(id);
  if (!p) return notFound();

  return (
    <div className="grid">
      <h1>{p.title}</h1>
      <div className="badge">{p.price}</div>
      <p>{p.description}</p>
    </div>
  );
}
