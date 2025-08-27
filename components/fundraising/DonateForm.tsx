// components/fundraising/DonateForm.tsx
'use client';

import Image from 'next/image';
import { useState, useId } from 'react';

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
  const [showName, setShowName] = useState(false);
  const [nickname, setNickname] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const nameId = useId();
  const anonId = useId();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Replace with your upload + donation API call
    alert(
      `Submitted donation for ${fundraisingId}\n` +
        `Mode: ${showName ? 'show name' : 'anonymous'}\n` +
        `Nickname: ${nickname}\n` +
        `Amount: ${amount} THB\n` +
        `Slip: ${file ? file.name : 'none'}`
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Donate Money</h1>

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

        <Row label="PromptPay QR code">
          <Image
            src={bankInfo.qrUrl}
            alt="PromptPay QR code"
            className="h-40 w-40 rounded-md border object-contain"
          />
        </Row>

        {/* Upload Slip */}
        <Row label="Upload Slip">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-100 px-4 py-6 text-sm hover:bg-zinc-200">
            <span className="text-xl">＋</span>
            <span>{file ? file.name : 'Upload .png, .jpg, .jpeg'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
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
          />
        </Row>

        <div className="pt-2">
          <button
            type="submit"
            className="w-40 rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300"
          >
            Submit
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
