// app/public/fundraising/[id]/donate/page.tsx
import { use } from 'react';
import { notFound } from 'next/navigation';
import { getFundraisingById } from '@/lib/mock';
import DonateForm from '@/components/fundraising/DonateForm';

export default function DonatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 15: unwrap Promise params
  const { id } = use(params);

  const item = getFundraisingById(id);
  if (!item) return notFound();

  // You can override these with fields on your mock if you later add them.
  const bankInfo = {
    bankBookName: 'Krungsri Bank',
    bankBookAccount: '4320596868',
    bankName: 'Min Thuka',
    qrUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
  };

  return <DonateForm fundraisingId={id} bankInfo={bankInfo} />;
}
