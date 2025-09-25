// app/auso/page.tsx
import Image from 'next/image';
import { getSessionRole } from '@/lib/auth';

export default async function AUSOHome() {
  const role = await getSessionRole();
  // This page is also protected by middleware; this is a belt-and-suspenders check.
  if (role !== 'auso') {
    return <div className="p-6">Forbidden</div>;
  }
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Dashboard</h1>

      <h2 className="mt-4 text-sm font-semibold">July Calendar</h2>
      <div
        className="relative mt-2 w-full overflow-hidden rounded-md border border-zinc-200"
        style={{ aspectRatio: '16 / 9' }}  // keeps a nice wide calendar shape
      >
        <Image
          src="/app/public/image/home/june-calendar.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 1000px"
          className="object-cover"
          priority
        />
      </div>
    </main>
  );
}
