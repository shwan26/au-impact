'use client';

import { useState } from 'react';

export default function CreateAccountPage() {
  const [form, setForm] = useState({
    fullName: '',
    nickName: '',
    faculty: '',
    year: '',
    dob: '',
    nationality: '',
    lineId: '',
    phone: '',
    studentId: '',
    email: '',
    password: '',
  });

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: hook this up to your API
    alert(`Account created for ${form.fullName || form.email}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-extrabold">Create Account</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Full Name">
          <input className="w-full rounded-md border px-3 py-2" value={form.fullName} onChange={onChange('fullName')} />
        </Field>
        <Field label="Nick Name">
          <input className="w-full rounded-md border px-3 py-2" value={form.nickName} onChange={onChange('nickName')} />
        </Field>
        <Field label="Faculty">
          <input className="w-full rounded-md border px-3 py-2" value={form.faculty} onChange={onChange('faculty')} />
        </Field>
        <Field label="Current Year of Study">
          <input className="w-full rounded-md border px-3 py-2" value={form.year} onChange={onChange('year')} />
        </Field>
        <Field label="Date of Birth">
          <input type="date" className="w-full rounded-md border px-3 py-2" value={form.dob} onChange={onChange('dob')} />
        </Field>
        <Field label="Nationality (Thai / Non - Thai)">
          <input className="w-full rounded-md border px-3 py-2" value={form.nationality} onChange={onChange('nationality')} />
        </Field>
        <Field label="Line Id">
          <input className="w-full rounded-md border px-3 py-2" value={form.lineId} onChange={onChange('lineId')} />
        </Field>
        <Field label="Phone Number">
          <input className="w-full rounded-md border px-3 py-2" value={form.phone} onChange={onChange('phone')} />
        </Field>
        <Field label="StudentID">
          <input className="w-full rounded-md border px-3 py-2" value={form.studentId} onChange={onChange('studentId')} />
        </Field>
        <Field label="AU Email">
          <input type="email" className="w-full rounded-md border px-3 py-2" value={form.email} onChange={onChange('email')} />
        </Field>
        <Field label="Password">
          <input type="password" className="w-full rounded-md border px-3 py-2" value={form.password} onChange={onChange('password')} />
        </Field>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-md bg-zinc-200 px-5 py-2 font-medium text-zinc-800 hover:bg-zinc-300"
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block pb-1">{label}</span>
      {children}
    </label>
  );
}
