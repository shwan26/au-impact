'use client';

import { useEffect, useState } from 'react';

const genNo = () => `M${Math.floor(100000 + Math.random() * 900000)}`;

export default function SAUCreateMerchStationaryPage() {
  const [no, setNo] = useState('');
  useEffect(() => setNo(genNo()), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get('title') || ''),
      contactName: String(fd.get('contactName') || ''),
      contactLineId: String(fd.get('contactLineId') || ''),
      price: Number(fd.get('price') || 0),
      status: 'PENDING',
    };
    const res = await fetch('/api/merchandise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return alert('❌ Failed to create merchandise');
    alert('✅ Merchandise created');
    location.href = '/sau/merchandise';
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Merchandise — Stationary</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>
        <Row label="Merchandise Number">
          <div className="py-2 font-mono">{no || '—'}</div>
          <input type="hidden" name="merchNumber" value={no} />
        </Row>
        <Field label="Merchandise Name" name="title" required />
        <Field label="Contact Person" name="contactName" />
        <Field label="Contact LineID" name="contactLineId" />
        <Field label="Price" name="price" type="number" min={0} required />
        <UploadRow label="Overview Photo" name="overview" />
        <div className="flex items-center gap-3 pt-2">
          <a href="/sau/merchandise" className="rounded-md border border-zinc-300 bg-white px-5 py-2 text-sm font-medium hover:bg-zinc-50">
            Back
          </a>
          <button type="submit" className="rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Field(props: { label: string; name: string; type?: string; min?: number; required?: boolean }) {
  const { label, name, type = 'text', min, required } = props;
  return (
    <Row label={label}>
      <input
        id={name}
        name={name}
        type={type}
        min={min}
        required={required}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </Row>
  );
}
function UploadRow({ label, name }: { label: string; name: string }) {
  return (
    <Row label={label}>
      <label
        htmlFor={name}
        className="flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200"
      >
        ＋ Upload .png, .jpg, .jpeg
      </label>
      <input id={name} type="file" name={name} accept="image/png,image/jpeg" className="hidden" />
    </Row>
  );
}
