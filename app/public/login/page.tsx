// app/login/page.tsx
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      {/* Login box */}
      <div className="max-w-xl">
        <LoginForm />
      </div>

      {/* Portal section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Portal</h2>

        {/* Always two columns (side by side) */}
        <div className="grid grid-cols-2 gap-6">
          {/* AUSO */}
          <Link
            href="/portal/auso"
            className="block rounded-2xl border border-zinc-300 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-300"
          >
            <div className="flex h-28 items-center justify-center px-6 text-center">
              <h3 className="text-xl font-bold">Student Organization (AUSO)</h3>
            </div>
          </Link>

          {/* SAU */}
          <Link
            href="/portal/sau"
            className="block rounded-2xl border border-zinc-300 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-300"
          >
            <div className="flex h-28 items-center justify-center px-6 text-center">
              <h3 className="text-xl font-bold">Student Activity Unit (SAU)</h3>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
