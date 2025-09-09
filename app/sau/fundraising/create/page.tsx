'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function genFundProjectNumber() {
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `F${rnd}`;
}

export default function SAUCreateFundraisingPage() {
  const router = useRouter();

  // Generate project number on the client to avoid hydration mismatch
  const [projectNumber, setProjectNumber] = useState('');
  useEffect(() => setProjectNumber(genFundProjectNumber()), []);

  const [posterFiles, setPosterFiles] = useState<FileList | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    // 👉 No backend writing: just succeed and go back to list
    alert('Fundraising created successfully.');
    router.push('/sau/fundraising');
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">Fundraising</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Row label="Activity Unit">
          <div className="py-2">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Project Number">
          <div className="py-2 font-mono">{projectNumber || '—'}</div>
          <input type="hidden" name="projectNumber" value={projectNumber} />
        </Row>

        <Field label="Project Name" name="projectName" required />
        <Field label="Organizer Name" name="organizerName" />
        <Field label="Organizer LineID" name="organizerLineId" />
        <Field label="Event Venue" name="eventVenue" />

        {/* Dates */}
        <Row label="Event Date From">
          <div className="grid w-full grid-cols-2 items-center gap-3">
            <input
              type="date"
              name="dateFrom"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            />
            <div className="text-center text-sm text-zinc-500">To</div>
            <input
              type="date"
              name="dateTo"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 col-span-2 sm:col-span-1"
            />
          </div>
        </Row>

        <Field label="Expected Money Amount" name="expectedAmount" type="number" min={0} />

        {/* Upload Poster */}
        <Row label="Upload Poster">
          <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
            <span className="text-xl">＋</span>
            <span>{posterFiles?.[0]?.name ?? 'Upload .png, .jpg, .jpeg (up to 5 photos)'}</span>
            <input
              type="file"
              name="poster"
              accept="image/png,image/jpeg"
              multiple
              onChange={(e) => setPosterFiles(e.currentTarget.files)}
              className="hidden"
            />
            <span className="text-[11px] text-zinc-500">(up to 5 photos)</span>
          </label>
        </Row>

        <Field label="Write Caption" name="caption" />

        <Field label="Bank Book Name" name="bankBookName" />
        <Field label="Bank Book Account" name="bankBookAccount" />
        <Field label="Bank Name" name="bankName" />

        {/* PromptPay QR */}
        <Row label="PromptPay QR code">
          <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
            <span className="text-xl">＋</span>
            <span>{qrFile?.name ?? 'Upload QR image (.png, .jpg, .jpeg)'}</span>
            <input
              type="file"
              name="promptpayQr"
              accept="image/png,image/jpeg"
              onChange={(e) => setQrFile(e.currentTarget.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </Row>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!projectNumber || submitting}
            className="rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </main>
  );
}

/* ---------- small helpers (same style as your other forms) ---------- */

function Row({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <Row label={label}>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </Row>
  );
}
