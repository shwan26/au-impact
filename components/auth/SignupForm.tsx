'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; // your browser client (PKCE)

type FormState = {
  fullName: string;
  nickName: string;
  faculty: string;
  year: string;         // keep as string for input; cast to number on submit
  dob: string;          // yyyy-mm-dd
  nationality: string;
  lineId: string;
  phone: string;
  studentId: string;
  email: string;
  password: string;
};

export default function SignupForm() {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
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

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const toNull = (v: string) => (v.trim() === '' ? null : v.trim());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setOk(null);

    // Basic AU email gate (optional — keep/remove as you wish)
    // Example: require "@au.edu" — adjust to your real domain.
    // if (!form.email.endsWith('@au.edu')) {
    //   setErr('Please use your AU email address.');
    //   setBusy(false);
    //   return;
    // }

    const payload = {
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: toNull(form.fullName) ?? form.email.trim(),
          nick_name: toNull(form.nickName),
          faculty: toNull(form.faculty),
          year: form.year.trim() ? Number(form.year.trim()) : null,
          dob: toNull(form.dob),                   // keep ISO date string
          nationality: toNull(form.nationality),
          line_id: toNull(form.lineId),
          phone: toNull(form.phone),
          student_id: toNull(form.studentId),
        },
      },
    };

    const { data, error } = await supabase.auth.signUp(payload);

    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    // If confirmations are ON, there’s no session yet.
    if (!data.session) {
      setOk('Account created. Please check your email to confirm.');
      setBusy(false);
      return;
    }

    // Otherwise (e.g., confirmations OFF in dev), redirect after signup.
    setBusy(false);
    router.push('/public/profile');
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
      <Field label="Full Name">
        <input className="w-full rounded-md border px-3 py-2" value={form.fullName} onChange={onChange('fullName')} />
      </Field>
      <Field label="Nick Name">
        <input className="w-full rounded-md border px-3 py-2" value={form.nickName} onChange={onChange('nickName')} />
      </Field>
      <Field label="Faculty">
        <input className="w-full rounded-md border px-3 py-2" value={form.faculty} onChange={onChange('faculty')} />
      </Field>
      <Field label="Current Year of Study (1 - 8)">
        <input
          className="w-full rounded-md border px-3 py-2"
          value={form.year}
          inputMode="numeric"
          pattern="[0-9]*"
          onChange={onChange('year')}
        />
      </Field>
      <Field label="Date of Birth">
        <input
          type="date"
          className="w-full rounded-md border px-3 py-2"
          value={form.dob}
          onChange={onChange('dob')}
        />
      </Field>
      <Field label="Nationality (Thai / Non - Thai)">
        <input className="w-full rounded-md border px-3 py-2" value={form.nationality} onChange={onChange('nationality')} />
      </Field>
      <Field label="Line ID">
        <input className="w-full rounded-md border px-3 py-2" value={form.lineId} onChange={onChange('lineId')} />
      </Field>
      <Field label="Phone Number">
        <input
          className="w-full rounded-md border px-3 py-2"
          value={form.phone}
          onChange={onChange('phone')}
          inputMode="tel"
        />
      </Field>
      <Field label="Student ID">
        <input className="w-full rounded-md border px-3 py-2" value={form.studentId} onChange={onChange('studentId')} />
      </Field>
      <Field label="AU Email / Personal Email">
        <input
          type="email"
          className="w-full rounded-md border px-3 py-2"
          value={form.email}
          onChange={onChange('email')}
          required
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          className="w-full rounded-md border px-3 py-2"
          value={form.password}
          onChange={onChange('password')}
          required
          minLength={6}
        />
      </Field>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && <p className="text-sm text-green-700">{ok}</p>}

      <div className="pt-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-zinc-200 px-5 py-2 font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Create Account'}
        </button>
      </div>
    </form>
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
