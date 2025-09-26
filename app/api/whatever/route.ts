// app/api/whatever/route.ts
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();  // ← await
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  // …use supabase with RLS as the authenticated user
}
