import { notFound } from 'next/navigation';
import ProductForm from '@/components/forms/ProductForm';
import { getMerchById } from '@/lib/mock';

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getMerchById(id);
  if (!p) return notFound();

  return (
    <div>
      <h1>Edit Product</h1>
      <ProductForm initial={p} />
    </div>
  );
}
