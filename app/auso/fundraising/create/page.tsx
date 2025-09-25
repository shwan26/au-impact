// app/auso/fundraising/create/page.tsx
'use client';

import FundraisingForm from '@/components/forms/FundraisingForm';

export default function CreateFundraisingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Create Fundraising Project
        </h1>
        <p className="text-sm text-zinc-600">
          Fill out the form below to start a new fundraising initiative for AUSO.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm">
        <FundraisingForm />
      </section>
    </main>
  );
}
