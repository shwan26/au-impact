'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/mock';
import Image from 'next/image';

export default function ParticipantRegisterPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const ev = getEventById(id);
  if (!ev) return notFound();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Submitted participant registration for ${ev.title}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Register Form as Participant</h1>

      <p className="mt-4 text-sm">
        <span className="font-bold">Thank you for your interest in joining the event!</span>
        <br />
        Organized by: Kritapas Nakin
        <br />
        Contact Line: @kritapas
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Full Name" name="fullName" />
        <Field label="Nick Name" name="nickName" />
        <Field label="Faculty" name="faculty" />
        <Field label="Current Year of Study" name="year" />
        <Field label="Date of Birth" name="dob" type="date" />
        <Field label="Nationality (Thai / Non - Thai)" name="nationality" />
        <Field label="Line ID" name="lineId" />
        <Field label="Phone Number" name="phone" />
        <Field label="StudentID" name="studentId" />
        <Field label="Have you heard about this event" name="heardAbout" />
        <Field
          label="What are you interested in and want to know more about from this event?"
          name="interest"
        />

        <div className="pt-2 text-sm">
          Please join the line group for further information
          <br />
          Line –{' '}
          <Link
            href="https://line.me/R/ti/g/D76mUpZTnD"
            className="text-blue-600 underline"
            target="_blank"
          >
            https://line.me/R/ti/g/D76mUpZTnD
          </Link>
        </div>

      
        <Image
          src="/images/line-qr.png"
          alt="Line QR"
          className="mt-4 h-48 w-48 rounded-md border object-contain"
        />

        <button
          type="submit"
          className="mt-6 rounded-md bg-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        name={name}
        type={type}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  );
}
