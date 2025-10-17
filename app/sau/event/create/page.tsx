// app/sau/merchandise/create/page.tsx
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
  const [special, setSpecial] = useState<'yes' | 'no'>('no');

  useEffect(() => setMerchNo(genMerchNumber()), []);

  const disabledSpecial = special === 'no';

  function onChangeCategory(next: Category) {
    setCategory(next);
    router.push(categoryToPath(next));
  }

  function validate(form: HTMLFormElement) {
    const get = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null;

    // 1) Merchandise Name
    const titleEl = get('title');
    if (!titleEl || !titleEl.value.trim()) {
      return { ok: false, message: 'Please enter the Merchandise Name.', el: titleEl };
    }

    // 2) Contact Person
    const contactNameEl = get('contactName');
    if (!contactNameEl || !contactNameEl.value.trim()) {
      return { ok: false, message: 'Please enter the Contact Person.', el: contactNameEl };
    }

    // 3) Contact LineID
    const contactLineIdEl = get('contactLineId');
    if (!contactLineIdEl || !contactLineIdEl.value.trim()) {
      return { ok: false, message: 'Please enter the Contact LineID.', el: contactLineIdEl };
    }

    // 4) Price (> 0)
    const priceEl = get('price');
    const priceVal = Number(priceEl?.value ?? '');
    if (!priceEl || !Number.isFinite(priceVal) || priceVal <= 0) {
      return { ok: false, message: 'Please enter a valid Price greater than 0.', el: priceEl };
    }

    // 5) Required main images — by id
    const needFile = (id: string, label: string) => {
      const fileEl = document.getElementById(id) as HTMLInputElement | null;
      const files = fileEl?.files;
      if (!files || files.length === 0) {
        return { ok: false as const, message: `Please upload ${label}.`, el: fileEl };
      }
      return { ok: true as const };
    };

    const overview = needFile('overview', 'an Overview Photo');
    if (!overview.ok) return overview;

    const front = needFile('front', 'a Front View photo');
    if (!front.ok) return front;

    const back = needFile('back', 'a Back View photo');
    if (!back.ok) return back;

    // 6) At least one size
    const sizeChecks = form.querySelectorAll<HTMLInputElement>('input[name="sizes"]:checked');
    if (sizeChecks.length === 0) {
      return { ok: false, message: 'Please select at least one Size.' };
    }

    // 7) Special price rules (if enabled)
    if (special === 'yes') {
      const qtyEl = get('specialQty');
      const pctEl = get('specialPct');
      const qty = Number(qtyEl?.value ?? 0);
      const pct = Number(pctEl?.value ?? 0);
      if (!qty || qty <= 0) {
        return { ok: false, message: 'Please enter Special Quantity (must be > 0).', el: qtyEl };
      }
      if (!pct || pct <= 0 || pct > 100) {
        return {
          ok: false,
          message: 'Please enter Special Percentage between 1 and 100.',
          el: pctEl,
        };
      }
    }

    return { ok: true };
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const v = validate(form);
    if (!v.ok) {
      alert(v.message);
      (v as any).el?.focus();
      (v as any).el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

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

      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <Field label="Merchandise Name" name="title" />

        <Row label="Merchandise Category">
          <select
            className="w-60 rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            value={category}
            onChange={(e) => onChangeCategory(e.target.value as Category)}
          >
            <option value="Clothes">Clothes</option>
            <option value="Stationary">Stationary</option>
            <option value="Accessory">Accessory</option>
          </select>
        </Row>

        <Field label="Contact Person" name="contactName" />
        <Field label="Contact LineID" name="contactLineId" />
        <Field label="Price" name="price" type="number" min={1} step="1" />

        {/* Required main images */}
        <UploadRow label="Overview Photo" name="overview" id="overview" />
        <UploadRow label="Front View"     name="front"    id="front" />
        <UploadRow label="Back View"      name="back"     id="back" />

        {/* Size chart */}
        <Row label="Size Chart">
          <div className="flex flex-wrap gap-4 text-sm">
            {['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input type="checkbox" name="sizes" value={s} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </Row>

        {/* Special Price */}
        <Row label="Special Price">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="special"
                value="yes"
                checked={special === 'yes'}
                onChange={() => setSpecial('yes')}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="special"
                value="no"
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
          min={1}
          disabled={disabledSpecial}
          className={disabledSpecial ? 'opacity-50 pointer-events-none' : ''}
        />
        <Field
          label="Percentage"
          name="specialPct"
          type="number"
          min={1}
          max={100}
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

/* ---------- helpers ---------- */

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
  id,
  type = 'text',
  min,
  max,
  step,
  disabled,
  className,
}: {
  label: string;
  name: string;
  id?: string;
  type?: string;
  min?: number;
  max?: number;
  step?: string | number;
  disabled?: boolean;
  className?: string;
}) {
  const inputId = id ?? name;
  return (
    <Row label={label}>
      <input
        id={inputId}
        name={name}
        type={type}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 ${
          className ?? ''
        }`}
      />
    </Row>
  );
}

function UploadRow({
  label,
  name,
  id,
}: {
  label: string;
  name: string;
  id?: string;
}) {
  const inputId = id ?? name;
  return (
    <Row label={label}>
      <label
        htmlFor={inputId}
        className="flex h-28 w-60 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200"
      >
        ＋ Upload .png, .jpg, .jpeg
      </label>
      <input
        id={inputId}
        type="file"
        name={name}
        accept="image/png,image/jpeg"
        className="hidden"
      />
    </Row>
  );
}
