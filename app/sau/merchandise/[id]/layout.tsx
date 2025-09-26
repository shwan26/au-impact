// app/sau/merchandise/[id]/layout.tsx
import type { ReactNode } from 'react';

// ✅ Server by default (no "use client")
export const metadata = {
  title: 'Edit Merchandise (SAU)',
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/merchandise/${params.id}`, { cache: 'no-store' });
  const merch = res.ok ? await res.json() : null;
  return {
    title: merch?.Title ? `Edit: ${merch.Title} (SAU)` : 'Edit Merchandise (SAU)',
  };
}


export default function SAUMerchLayout({
  children,
}: {
  children: ReactNode;
}) {
  // You can add shared layout UI here (breadcrumbs, section title, etc.)
  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      {children}
    </section>
  );
}
