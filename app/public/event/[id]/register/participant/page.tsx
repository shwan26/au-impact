// app/public/event/[id]/register/participant/page.tsx
'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type ApiEvent = { EventID?: string | number | null; Title?: string | null };

export default function ParticipantRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState<string>('Loading…');
  const [exists, setExists] = useState<boolean>(true);

  // LINE (participant)
  const [lineUrl, setLineUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [orgLineId, setOrgLineId] = useState<string | null>(null);

  // Payment
  const [isPaid, setIsPaid] = useState(false);
  const [bankName, setBankName] = useState<string | null>(null);
  const [bankNo, setBankNo] = useState<string | null>(null);
  const [bankAccName, setBankAccName] = useState<string | null>(null);
  const [ppQr, setPpQr] = useState<string | null>(null);

  // Slip
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  const [slipUploading, setSlipUploading] = useState(false);
  const [slipErr, setSlipErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/events/${id}`, { cache: 'no-store' });
        const text = await res.text();
        if (!res.ok || !text) throw new Error('not ok');
        const ev: ApiEvent = JSON.parse(text);
        if (cancelled) return;

        setTitle(((ev as any)?.Title ?? '').trim() || 'Untitled Event');
        setExists(!!((ev as any)?.EventID ?? ev));

        const anyEv = ev as any;

        // Participant-specific first, fallback to generic
        setLineUrl(
          (anyEv?.LineGpURL_Participant ?? anyEv?.linegpurl_participant ?? anyEv?.LineGpURL ?? anyEv?.linegpurl ?? '') || null
        );
        setQrUrl(
          (anyEv?.LineGpQRCode_Participant ?? anyEv?.linegpqrcode_participant ?? anyEv?.LineGpQRCode ?? anyEv?.linegpqrcode ?? '') || null
        );
        setOrgLineId(
          (anyEv?.OrganizerLineID ?? anyEv?.organizerlineid ?? '') || null
        );

        const feeNum = Number(anyEv?.Fee);
        const paid = Number.isFinite(feeNum) && feeNum > 0;
        setIsPaid(paid);
        if (paid) {
          setBankName((anyEv?.BankName ?? '') || null);
          setBankNo((anyEv?.BankAccountNo ?? '') || null);
          setBankAccName((anyEv?.BankAccountName ?? '') || null);
          setPpQr((anyEv?.PromptPayQR ?? '') || null);
        }
      } catch {
        if (!cancelled) {
          setExists(false);
          setTitle('Event not found');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function uploadSlip(file: File) {
    try {
      setSlipUploading(true);
      setSlipErr(null);

      const form = new FormData();
      form.append('file', file);

      const r = await fetch(`/api/events/${id}/payments/slip/upload`, {
        method: 'POST',
        body: form,
      });
      const t = await r.text();
      const j = t ? JSON.parse(t) : {};
      if (!r.ok) throw new Error(j?.error || 'Upload failed');

      setSlipUrl(j?.url || null);
    } catch (e: any) {
      setSlipErr(e?.message || 'Upload failed');
    } finally {
      setSlipUploading(false);
    }
  }

  if (!exists) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <button onClick={() => router.push(`/public/event/${id}`)} className="mt-4 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-50">Back to event</button>
      </div>
    );
  }

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      role: 'PARTICIPANT',
      FullName: String(fd.get('fullName') || '').trim(),
      NickName: String(fd.get('nickName') || '').trim(),
      Faculty: String(fd.get('faculty') || '').trim(),
      Year: String(fd.get('year') || '').trim(),
      DOB: fd.get('dob') ? new Date(String(fd.get('dob'))).toISOString() : null,
      Nationality: String(fd.get('nationality') || '').trim(),
      LineID: String(fd.get('lineId') || '').trim(),
      Phone: String(fd.get('phone') || '').trim(),
      StudentID: String(fd.get('studentId') || '').trim(),
      HeardAbout: String(fd.get('heardAbout') || '').trim(),
      Interest: String(fd.get('interest') || '').trim(),

      // include slip url (backend can choose to save it)
      PaymentSlipURL: slipUrl ?? null,
    };

    if (!payload.FullName || !payload.StudentID || !payload.Phone) {
      setErrorMsg('Please fill in Full Name, Student ID and Phone Number.');
      return;
    }
    if (!/^[\d+\-\s()]{6,}$/.test(payload.Phone)) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    if (isPaid && !slipUrl) {
      setErrorMsg('Please upload your payment slip.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/events/${id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error((json as any)?.error || 'Failed to submit registration');

      alert(`Submitted participant registration for "${title}"`);
      router.push(`/public/event/${id}`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const fallbackLine = 'https://line.me/R/ti/g/D76mUpZTnD';
  const finalLine = lineUrl || fallbackLine;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Register as Participant</h1>
      <p className="mt-2 text-sm text-zinc-600">Event: <span className="font-semibold">{title}</span></p>

      {/* Organizer LINE ID if provided */}
      {orgLineId && (
        <div className="pt-2 text-sm">
          Organizer LINE ID — <span className="font-medium">{orgLineId}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Full Name *" name="fullName" required />
        <Field label="Nick Name" name="nickName" />
        <Field label="Faculty" name="faculty" />
        <Field label="Current Year of Study" name="year" />
        <Field label="Date of Birth" name="dob" type="date" />
        <Field label="Nationality (Thai / Non - Thai)" name="nationality" />
        <Field label="Line ID" name="lineId" />
        <Field label="Phone Number *" name="phone" required />
        <Field label="Student ID *" name="studentId" required />
        <Field label="Have you heard about this event?" name="heardAbout" />
        <Field label="What are you interested in and want to know more about from this event?" name="interest" />

        {errorMsg && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Participant LINE group */}
        <div className="pt-2 text-sm">
          Please join the LINE group for further information
          <br />
          LINE –{' '}
          <Link href={finalLine} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
            {finalLine}
          </Link>
        </div>

        <div className="mt-4">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="LINE QR" width={192} height={192} className="rounded-md border object-contain" />
          ) : (
            <Image src="/images/line-qr.png" alt="LINE QR" width={192} height={192} className="rounded-md border object-contain" priority />
          )}
        </div>

        {/* Payment for participants ONLY (if paid) */}
        {isPaid && (
          <div className="mt-6 rounded-md border border-zinc-200 p-3 text-sm space-y-3">
            <div className="font-semibold">Payment</div>
            <div>Bank name: {bankName || '-'}</div>
            <div>Account no.: {bankNo || '-'}</div>
            <div>Account name: {bankAccName || '-'}</div>
            {ppQr && (
              <div className="pt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ppQr} alt="PromptPay QR" width={192} height={192} className="rounded-md border object-contain" />
              </div>
            )}

            {/* Upload payment slip */}
            <div className="pt-3">
              <label className="block text-sm font-medium">Upload payment slip (PNG/JPG)</label>
              <label className="mt-2 flex h-28 w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-100 text-sm hover:bg-zinc-200">
                <span>{slipFile?.name ?? '＋ Select file'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.currentTarget.files?.[0] || null;
                    setSlipFile(f);
                    if (f) await uploadSlip(f);
                  }}
                />
              </label>
              {slipUploading && <div className="text-xs mt-1">Uploading…</div>}
              {slipErr && <div className="text-xs mt-1 text-red-600">{slipErr}</div>}
              {slipUrl && (
                <div className="text-xs mt-1">
                  Uploaded: <a href={slipUrl} target="_blank" className="text-blue-600 underline" rel="noreferrer">view slip</a>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="mt-6 rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  );
}
