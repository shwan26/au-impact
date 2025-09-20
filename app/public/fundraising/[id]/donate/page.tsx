// app/public/fundraising/[id]/donate/page.tsx
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import DonateForm from '@/components/fundraising/DonateForm';

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

  // make sure the campaign exists (and fetch bank info if you store it)
  const res = await fetch(`${getBaseUrl()}/api/fundraising/${id}`, {
    cache: 'no-store',
    next: { revalidate: 0 },
  });
  if (!res.ok) return notFound();

  const bankInfo = {
    bankBookName: 'Krungsri Bank',
    bankBookAccount: '4320596868',
    bankName: 'Min Thuka',
    qrUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
  };

  return <DonateForm fundraisingId={id} bankInfo={bankInfo} />;
}
