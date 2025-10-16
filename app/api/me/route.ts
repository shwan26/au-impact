// app/api/me/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

// app/api/me/route.ts
export async function GET() {
  const supabase = await getSupabaseServer();

  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ user: null }, { status: 200 });

  const role = (user.app_metadata as any)?.role ?? 'user';

  const { data: profile } = await supabase
    .from('User')
    .select('"User_ID","FullName","AUEmail"')
    .eq('auth_uid', user.id)
    .maybeSingle();

  let sau: any = null;
  let auso: any = null;

  if (role === 'sau') {
    const { data } = await supabase
      .from('sau')
      .select('sau_id,name')             // use the actual casing your table uses
      .eq('auth_uid', user.id)
      .maybeSingle();
    sau = data ? { SAU_ID: data.sau_id, Name: data.name } : null;
  } else if (role === 'auso') {
    const { data } = await supabase
      .from('auso')
      .select('auso_id,name')
      .eq('auth_uid', user.id)
      .maybeSingle();
    auso = data ? { AUSO_ID: data.auso_id, Name: data.name } : null;
  } else {
    // 🔧 IMPORTANT: assign to the OUTER variables (no `const` here)
    const { data: s } = await supabase
      .from('sau')
      .select('sau_id,name')
      .eq('auth_uid', user.id)
      .maybeSingle();
    sau = s ? { SAU_ID: s.sau_id, Name: s.name } : null;

    const { data: a } = await supabase
      .from('auso')
      .select('auso_id,name')
      .eq('auth_uid', user.id)
      .maybeSingle();
    auso = a ? { AUSO_ID: a.auso_id, Name: a.name } : null;
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role,
      profile,
      org: { sau, auso },
    },
  });
}
