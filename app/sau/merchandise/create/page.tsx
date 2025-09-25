'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = 'Clothes' | 'Stationary' | 'Accessory';

function categoryToPath(cat: Category) {
  if (cat === 'Clothes') return '/sau/merchandise/create';
  if (cat === 'Stationary') return '/sau/merchandise/create/stationary';
  return '/sau/merchandise/create/accessory';
}

function genMerchNumber() {
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `M${rnd}`;
}

export default function SAUCreateMerchClothesPage() {
  const router = useRouter();
  const [merchNo, setMerchNo] = useState('');
  const [category, setCategory] = useState<Category>('Clothes');
  const [special, setSpecial] = useState<'yes'|'no'>('no');
  const [options, setOptions] = useState([{ id: 1 }]);

  useEffect(() => setMerchNo(genMerchNumber()), []);

  const disabledSpecial = special === 'no';

  function onChangeCategory(next: Category) {
    setCategory(next);
    router.push(categoryToPath(next));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fetch('/api/merchandise', { method: 'POST', body: fd })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed');
        return r.json();
      })
      .then(() => {
        alert('Merchandise created!');
        router.push('/sau/merchandise');
      })
      .catch((err) => alert(err.message));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Merchandise</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Row label="Activity Unit">
          <input type="hidden" name="sauId" value="1" />
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Merchandise Number">
          <div className="py-2 font-mono">{merchNo || '—'}</div>
          <input type="hidden" name="merchNumber" value={merchNo} />
        </Row>

        <Field label="Merchandise Name" name="title" />
        <Row label="Merchandise Category">
          <select
            className="w-60 rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            value={category}
            onChange={(e) => onChangeCategory(e.target.value as Category)}
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
        <UploadRow label="Front View" name="front" />
        <UploadRow label="Back View" name="back" />

        {/* Size chart – only for Clothes */}
        <Row label="Size Chart">
          <div className="flex flex-wrap gap-4 text-sm">
            {['XXS','XS','S','M','L','XL','2XL','3XL','4XL'].map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input type="checkbox" name="sizes" value={s} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </Row>

        {/* Options (photo + caption), add more */}
        {options.map((opt, idx) => (
          <div key={opt.id} className="space-y-3 rounded-lg border border-zinc-200 p-3">
            <div className="text-sm font-semibold">Option {idx + 1}</div>
            <UploadRow label="Photo" name={`option_${opt.id}_photo`} />
            <Field label="Caption" name={`option_${opt.id}_caption`} />
          </div>
        ))}
        <div>
          <button
            type="button"
            onClick={() => setOptions((o) => [...o, { id: (o.at(-1)?.id ?? 1) + 1 }])}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm hover:bg-zinc-50"
          >
            Add Option
          </button>
        </div>

        <Row label="Special Price">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="special" checked={special==='yes'} onChange={() => setSpecial('yes')} />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="special" checked={special==='no'} onChange={() => setSpecial('no')} />
              <span>No</span>
            </label>
          </div>
        </Row>

        <Field
          label="Quantity"
          name="specialQty"
          type="number"
          min={0}
          disabled={disabledSpecial}
          className={disabledSpecial ? 'opacity-50 pointer-events-none' : ''}
        />
        <Field
          label="Percentage"
          name="specialPct"
          type="number"
          min={0}
          disabled={disabledSpecial}
          className={disabledSpecial ? 'opacity-50 pointer-events-none' : ''}
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

/* helpers */
function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label, name, type = 'text', min, disabled, className,
}: {
  label: string; name: string; type?: string; min?: number; disabled?: boolean; className?: string;
}) {
  return (
    <Row label={label}>
      <input
        name={name}
        type={type}
        min={min}
        disabled={disabled}
        className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${className ?? ''}`}
      />
    </Row>
  );
}

function UploadRow({ label, name }: { label: string; name: string }) {
  return (
    <Row label={label}>
      <label className="flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200">
        <span>＋ Upload .png, .jpg, .jpeg</span>
        <input type="file" name={name} accept="image/png,image/jpeg" className="hidden" />
      </label>
    </Row>
  );
}
