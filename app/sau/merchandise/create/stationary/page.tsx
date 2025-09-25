'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function genMerchNumber() {
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `M${rnd}`;
}

export default function SAUCreateMerchStationaryPage() {
  const router = useRouter();
  const [merchNo, setMerchNo] = useState('');
  const [special, setSpecial] = useState<'yes' | 'no'>('no');

  useEffect(() => setMerchNo(genMerchNumber()), []);
  const disabledSpecial = special === 'no';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      itemid: merchNo,
      title: formData.get('title'),
      price: Number(formData.get('price')),
      contactname: formData.get('contactName'),
      contactlineid: formData.get('contactLineId'),
      pickuppoint: formData.get('pickupPoint'),
      pickupdate: formData.get('pickupDate'),
      pickuptime: formData.get('pickupTime'),
      posterurl: '',
      frontviewurl: '',
      backviewurl: '',
      sizecharturl: '',
      status: 'PENDING',
    };

    try {
      const res = await fetch('/api/merchandise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());

      alert('Stationary merchandise created!');
      router.push('/sau/merchandise');
    } catch (err) {
      console.error('Create error:', err);
      alert('Failed to create stationary merchandise');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Merchandise – Stationary</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Row label="Activity Unit"><div className="py-2">Student Council of Theodore Maria School of Arts</div></Row>
        <Row label="Merchandise Number"><div className="py-2 font-mono">{merchNo}</div></Row>
        <Field label="Merchandise Name" name="title" />
        <Field label="Contact Person" name="contactName" />
        <Field label="Contact LineID" name="contactLineId" />
        <Field label="Price" name="price" type="number" min={0} />

        <UploadRow label="Overview Photo" name="overview" />
        <UploadRow label="Product Photo" name="front" />
        <UploadRow label="Extra Photo" name="back" />

        <Row label="Special Price">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2"><input type="radio" checked={special==='yes'} onChange={()=>setSpecial('yes')} /><span>Yes</span></label>
            <label className="flex items-center gap-2"><input type="radio" checked={special==='no'} onChange={()=>setSpecial('no')} /><span>No</span></label>
          </div>
        </Row>
        <Field label="Quantity" name="specialQty" type="number" min={0} disabled={disabledSpecial} className={disabledSpecial?'opacity-50 pointer-events-none':''}/>
        <Field label="Percentage" name="specialPct" type="number" min={0} disabled={disabledSpecial} className={disabledSpecial?'opacity-50 pointer-events-none':''}/>

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={()=>router.push('/sau/merchandise')} className="rounded-md border border-zinc-300 bg-white px-5 py-2 text-sm font-medium hover:bg-zinc-50">Back</button>
          <button type="submit" className="rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300">Submit</button>
        </div>
      </form>
    </div>
  );
}

/* helpers */
function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]"><div className="py-2 text-sm font-medium text-zinc-700">{label}</div><div>{children}</div></div>;
}
function Field({ label, name, type='text', min, disabled, className }:{ label: string; name: string; type?: string; min?: number; disabled?: boolean; className?: string; }) {
  return <Row label={label}><input name={name} type={type} min={min} disabled={disabled} className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${className??''}`} /></Row>;
}
function UploadRow({ label, name }: { label: string; name: string }) {
  return <Row label={label}><label className="flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200"><span>＋ Upload .png, .jpg, .jpeg</span><input type="file" name={name} accept="image/png,image/jpeg" className="hidden" /></label></Row>;
}
