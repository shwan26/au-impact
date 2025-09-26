// app/api/me/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  const supabase = await getSupabaseServer();

  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ user: null }, { status: 200 });

  // app metadata role (set this when creating users)
  const role = (user.app_metadata as any)?.role ?? 'user';

  // App profile row
  const { data: profile } = await supabase
    .from('User') // quoted in SQL, but Supabase accepts the unquoted string here
    .select('"User_ID","FullName","AUEmail"')
    .eq('auth_uid', user.id)
    .maybeSingle();

  // Linked orgs (try the one that matches the role first)
  let sau: any = null;
  let auso: any = null;

  if (role === 'sau') {
    const { data } = await supabase
      .from('SAU')
      .select('"SAU_ID","Name"')
      .eq('auth_uid', user.id)
      .maybeSingle();
    sau = data ?? null;
  } else if (role === 'auso') {
    const { data } = await supabase
      .from('AUSO')
      .select('"AUSO_ID","Name"')
      .eq('auth_uid', user.id)
      .maybeSingle();
    auso = data ?? null;
  } else {
    // Optional: still try both to be safe
    const { data: s } = await supabase
      .from('SAU')
      .select('"SAU_ID","Name"')
      .eq('auth_uid', user.id)
      .maybeSingle();
    sau = s ?? null;

    const { data: a } = await supabase
      .from('AUSO')
      .select('"AUSO_ID","Name"')
      .eq('auth_uid', user.id)
      .maybeSingle();
    auso = a ?? null;
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role,
      profile, // may be null if no row yet
      org: {
        sau,  // { SAU_ID, Name } | null
        auso, // { AUSO_ID, Name } | null
      },
    },
  });
}
