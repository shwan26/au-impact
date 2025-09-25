// app/sau/layout.tsx
import Footer from '@/components/layout/Footer';
import SAUNav from '@/components/nav/SAUNav';

import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

export default async function SAULayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.app_metadata as any)?.role;

  if (!user || role !== 'sau') redirect('/portal/sau');

  return (
    <div>
        <SAUNav />
        <main className="container">{children}</main>
        <Footer />
      </div>
    );
}
