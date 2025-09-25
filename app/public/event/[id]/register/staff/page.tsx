// app/public/event/[id]/register/staff/page.tsx
'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type ApiEvent = { EventID?: string | number | null; Title?: string | null };

export default function StaffRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState<string>('Loading…');
  const [exists, setExists] = useState<boolean>(true);

  const [scholarHours, setScholarHours] = useState<number | null>(null);
  const [orgLineId, setOrgLineId] = useState<string | null>(null);
  const [lineUrl, setLineUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/events/${id}`, { cache: 'no-store' });
        const text = await res.text();
        if (!res.ok || !text) throw new Error('not ok');
        const ev: ApiEvent = JSON.parse(text);

        if (!cancelled) {
          setTitle(((ev as any)?.Title ?? '').trim() || 'Untitled Event');
          setExists(!!((ev as any)?.EventID ?? ev));

          const anyEv = ev as any;
          const hrs = Number(anyEv?.ScholarshipHours ?? anyEv?.scholarshiphours);
          setScholarHours(Number.isFinite(hrs) ? hrs : null);

          setOrgLineId((anyEv?.OrganizerLineID ?? anyEv?.organizerlineid ?? '') || null);

          // Staff-specific group first, fallback to generic
          setLineUrl(
            (anyEv?.LineGpURL_Staff ?? anyEv?.linegpurl_staff ?? anyEv?.LineGpURL ?? anyEv?.linegpurl ?? '') || null
          );
          setQrUrl(
            (anyEv?.LineGpQRCode_Staff ?? anyEv?.linegpqrcode_staff ?? anyEv?.LineGpQRCode ?? anyEv?.linegpqrcode ?? '') || null
          );
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
      role: 'STAFF',
      FullName: String(fd.get('fullName') || '').trim(),
      NickName: String(fd.get('nickName') || '').trim(),
      Faculty: String(fd.get('faculty') || '').trim(),
      Year: String(fd.get('year') || '').trim(),
      DOB: fd.get('dob') ? new Date(String(fd.get('dob'))).toISOString() : null,
      Nationality: String(fd.get('nationality') || '').trim(),
      LineID: String(fd.get('lineId') || '').trim(),
      Phone: String(fd.get('phone') || '').trim(),
      StudentID: String(fd.get('studentId') || '').trim(),
    };

    if (!payload.FullName || !payload.StudentID || !payload.Phone) {
      setErrorMsg('Please fill in Full Name, Student ID and Phone Number.');
      return;
    }
    if (!/^[\d+\-\s()]{6,}$/.test(payload.Phone)) {
      setErrorMsg('Please enter a valid phone number.');
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

      alert(`Submitted staff registration for "${title}"`);
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
      <h1 className="text-3xl font-extrabold">Register as Staff</h1>
      <p className="mt-2 text-sm text-zinc-600">Event: <span className="font-semibold">{title}</span></p>

      <div className="pt-2 text-lg font-semibold">
        Scholarship hours – {Number.isFinite(scholarHours ?? NaN) ? scholarHours : 5} hours
      </div>

      {orgLineId && (
        <div className="pt-1 text-sm">
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

        {errorMsg && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* LINE group for STAFF */}
        <div className="pt-2 text-sm">
          Please join the STAFF LINE group for further information
          <br />
          LINE –{' '}
          <Link href={finalLine} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
            {finalLine}
          </Link>
        </div>

        <div className="mt-4">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="Line QR" width={192} height={192} className="rounded-md border object-contain" />
          ) : (
            <Image src="/images/line-qr.png" alt="Line QR" width={192} height={192} className="rounded-md border object-contain" priority />
          )}
        </div>

        <button type="submit" disabled={submitting} aria-busy={submitting}
          className="mt-6 rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-60">
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean; }) {
  return (
    <label className="block text-sm">
      {label}
      <input name={name} type={type} required={required} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200" />
    </label>
  );
}
