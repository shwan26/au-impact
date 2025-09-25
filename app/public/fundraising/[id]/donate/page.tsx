// app/public/fundraising/[id]/donate/page.tsx
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import DonateForm from '@/components/fundraising/DonateForm';

type ApiItem = {
  id: string | number;
  title: string;
  bankBookName?: string | null;
  bankBookAccount?: string | null;
  bankName?: string | null;
  qrUrl?: string | null;
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  return 'http://localhost:3000';
}

export default async function DonatePage(
  props: { params: Promise<{ id: string }> }
) {
  noStore();
  const { id } = await props.params;

  // fetch the fundraising campaign (includes bank info + QR)
  const res = await fetch(`${getBaseUrl()}/api/fundraising/${id}`, {
    cache: 'no-store',
    next: { revalidate: 0 },
  });
  if (!res.ok) return notFound();

  const item = (await res.json()) as ApiItem;

  const bankInfo = {
    bankBookName: item.bankBookName ?? '—',
    bankBookAccount: item.bankBookAccount ?? '—',
    bankName: item.bankName ?? '—',
    qrUrl: item.qrUrl ?? '',
  };

  return <DonateForm fundraisingId={String(id)} bankInfo={bankInfo} />;
}
