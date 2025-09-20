// app/auso/page.tsx
import Image from 'next/image';

export default function AUSOHome() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Dashboard</h1>

      <h2 className="mt-4 text-sm font-semibold">July Calendar</h2>
      <div
        className="relative mt-2 w-full overflow-hidden rounded-md border border-zinc-200"
        style={{ aspectRatio: '16 / 9' }}  // keeps a nice wide calendar shape
      >
        <Image
          src="/images/home/june-calendar.jpg"
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
