import Link from 'next/link';

export default function ProductCard({ id, title, price }: { id: string; title: string; price: number }){
  return (
    <div className="card">
      <h3><Link href={`/public/merchandise/${id}`}>{title}</Link></h3>
      <div className="badge">{price}</div>
    </div>
  );
}