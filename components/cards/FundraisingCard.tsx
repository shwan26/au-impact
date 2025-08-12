import Link from 'next/link';
import { Fundraising } from '@/types/db';
export default function FundraisingCard({ item }: { item: Fundraising }){
  return (
    <div className="card">
      <h3><Link href={`/public/fundraising/${item.id}`}>{item.title}</Link></h3>
      <div className="badge">Goal: {item.goal}</div>
      <p>{item.summary}</p>
    </div>
  );
}