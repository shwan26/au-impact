// app/sau/merchandise/[id]/layout.tsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import type { ReactNode } from 'react';
import { getSupabaseRSC } from '@/lib/supabaseServer';

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseRSC();
    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) return { title: 'Edit Merchandise (SAU)' };

    const { data } = await supabase
      .from('Merchandise')
      .select('Title')
      .eq('ItemID', idNum)
      .maybeSingle();

    return { title: data?.Title ? `Edit: ${data.Title} (SAU)` : 'Edit Merchandise (SAU)' };
  } catch {
    return { title: 'Edit Merchandise (SAU)' };
  }
}

export default function SAUMerchLayout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      {children}
    </section>
  );
}
