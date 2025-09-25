'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = 'Clothes' | 'Stationary' | 'Accessory';

const toPath = (c: Category) =>
  c === 'Clothes'
    ? '/sau/merchandise/create'
    : c === 'Stationary'
    ? '/sau/merchandise/create/stationary'
    : '/sau/merchandise/create/accessory';

function genNo() {
  return `M${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function SAUCreateMerchStationaryPage() {
  const router = useRouter();
  const [no, setNo] = useState('');
  const [special, setSpecial] = useState<'yes' | 'no'>('no');

  useEffect(() => setNo(genNo()), []);

  const disabled = special === 'no';

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert('Merchandise created!');
    router.push('/sau/merchandise');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Merchandise</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Merchandise Number">
          <div className="py-2 font-mono">{no || '—'}</div>
          <input type="hidden" name="merchNumber" value={no} />
        </Row>

        <Field label="Merchandise Name" name="title" />

        <Row label="Merchandise Category">
          <select
            className="w-60 rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            value="Stationary"
            onChange={(e) => router.push(toPath(e.target.value as Category))}
          >
            <option>Clothes</option>
            <option>Stationary</option>
            <option>Accessory</option>
          </select>
        </Row>

        <Field label="Contact Person" name="contactName" />
        <Field label="Contact LineID" name="contactLineId" />
        <Field label="Price" name="price" type="number" min={0} />

        <UploadRow label="Overview Photo" name="overview" />
        <UploadRow label="Product Photo" name="front" />
        <UploadRow label="Extra Photo" name="back" />

        <div className="rounded-lg border border-zinc-200 p-3">
          <div className="mb-2 text-sm font-semibold">Option 1</div>
          <UploadRow label="Photo" name="option_1_photo" />
          <Field label="Caption" name="option_1_caption" />
        </div>

        <Row label="Special Price">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="special"
                checked={special === 'yes'}
                onChange={() => setSpecial('yes')}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="special"
                checked={special === 'no'}
                onChange={() => setSpecial('no')}
              />
              <span>No</span>
            </label>
          </div>
        </Row>

        <Field
          label="Quantity"
          name="specialQty"
          type="number"
          min={0}
          disabled={disabled}
          className={disabled ? 'opacity-50 pointer-events-none' : ''}
        />
        <Field
          label="Percentage"
          name="specialPct"
          type="number"
          min={0}
          disabled={disabled}
          className={disabled ? 'opacity-50 pointer-events-none' : ''}
        />

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/sau/merchandise')}
            className="rounded-md border border-zinc-300 bg-white px-5 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

/* shared small helpers */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  min,
  disabled,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  min?: number;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Row label={label}>
      <input
        id={name}
        name={name}
        type={type}
        min={min}
        disabled={disabled}
        className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${
          className ?? ''
        }`}
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
      <input
        id={name}
        type="file"
        name={name}
        accept="image/png,image/jpeg"
        className="hidden"
      />
    </Row>
  );
}
