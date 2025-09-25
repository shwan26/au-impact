// components/fundraising/DonateForm.tsx
'use client';

import Image from 'next/image';
import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { uploadTo } from '@/lib/uploadClient';

export default function DonateForm({
  fundraisingId,
  bankInfo,
}: {
  fundraisingId: string;
  bankInfo: {
    bankBookName: string;
    bankBookAccount: string;
    bankName: string;
    qrUrl: string;
  };
}) {
  const router = useRouter();

  const [showName, setShowName] = useState(false);
  const [nickname, setNickname] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slipUrl, setSlipUrl] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const nameId = useId();
  const anonId = useId();

  async function uploadSlipIfNeeded() {
    if (!file) return null;
    setUploading(true);
    try {
      const { publicUrl } = await uploadTo('slip', file, fundraisingId);
      setSlipUrl(publicUrl);
      return publicUrl;
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setErr('Please enter a valid positive amount.');
      return;
    }

    try {
      setSubmitting(true);

      // 1) upload slip (if selected)
      const uploadedSlip = await uploadSlipIfNeeded();

      // 2) create donation
      const res = await fetch(
        `/api/fundraising/${encodeURIComponent(fundraisingId)}/donations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amt,
            name: showName ? nickname.trim() : '',
            anonymous: !showName,
            slip: uploadedSlip ?? (slipUrl || null),
          }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to submit donation');

      setOk('Thank you! Your donation was recorded.');
      setAmount('');
      setNickname('');
      setShowName(false);
      setFile(null);
      setSlipUrl('');

      // Refresh public detail totals / SAU list
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong while donating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Donate Money</h1>

      {/* Messages */}
      {err && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {ok && (
        <div className="mt-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          {ok}
        </div>
      )}

      {/* Toggle anonymous vs show name */}
      <div className="mt-6 flex items-center gap-8">
        <label htmlFor={anonId} className="flex cursor-pointer items-center gap-2">
          <input
            id={anonId}
            type="radio"
            name="nameMode"
            checked={!showName}
            onChange={() => setShowName(false)}
            className="h-4 w-4 accent-black"
          />
          <span>Keep Anonymous</span>
        </label>

        <label htmlFor={nameId} className="flex cursor-pointer items-center gap-2">
          <input
            id={nameId}
            type="radio"
            name="nameMode"
            checked={showName}
            onChange={() => setShowName(true)}
            className="h-4 w-4 accent-zinc-400"
          />
          <span>Show your name</span>
        </label>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {/* Nickname */}
        <Row label="Nickname">
          <input
            disabled={!showName}
            placeholder=""
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 outline-none disabled:opacity-60 focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        {/* Bank details */}
        <Row label="Bank Book Name">
          <div className="py-2">{bankInfo.bankBookName}</div>
        </Row>
        <Row label="Bank Book Account">
          <div className="py-2">{bankInfo.bankBookAccount}</div>
        </Row>
        <Row label="Bank Name">
          <div className="py-2">{bankInfo.bankName}</div>
        </Row>

        {/* QR code */}
        <Row label="PromptPay QR code">
          {bankInfo.qrUrl ? (
            <Image
              src={bankInfo.qrUrl}
              alt="PromptPay QR code"
              width={160}
              height={160}
              className="rounded-md border object-contain"
              priority
            />
          ) : (
            <div className="rounded-md border bg-zinc-50 p-6 text-sm text-zinc-500">
              QR not available
            </div>
          )}
        </Row>

        {/* Upload Slip */}
        <Row label="Upload Slip">
          <div className="flex w-full items-center gap-3">
            <label className="flex grow cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
              <span className="text-xl">＋</span>
              <span>{file ? file.name : 'Upload .png, .jpg, .jpeg'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </div>
          {uploading && <div className="mt-2 text-xs text-zinc-500">Uploading slip…</div>}
        </Row>

        {/* Amount */}
        <Row label="Amount (THB)">
          <input
            type="number"
            min={1}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            required
          />
        </Row>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-40 rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-4 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
