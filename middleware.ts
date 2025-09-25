// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseFromMiddleware } from '@/lib/supabaseMiddleware';

// Which role is required for a given path?
function requiredRoleFor(pathname: string): 'sau' | 'auso' | null {
  if (pathname === '/sau' || pathname.startsWith('/sau/')) return 'sau';
  if (pathname === '/auso' || pathname.startsWith('/auso/')) return 'auso';
  return null;
}

// Make sure cookies Supabase wrote to `res` also exist on the redirect response
function withSupabaseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => to.cookies.set(c));
  return to;
}

export async function middleware(req: NextRequest) {
  // IMPORTANT: let Supabase write refreshed cookies to this base response
  let res = NextResponse.next({ request: { headers: req.headers } });
  const supabase = supabaseFromMiddleware(req, res);

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  const need = requiredRoleFor(path);
  const role = (user?.app_metadata as any)?.role ?? null;

  // UX nicety: if you hit portal login but you're already the right role, go to dashboard
  if (path === '/portal/sau' && role === 'sau') {
    const r = NextResponse.redirect(new URL('/sau', req.url));
    return withSupabaseCookies(res, r);
  }
  if (path === '/portal/auso' && role === 'auso') {
    const r = NextResponse.redirect(new URL('/auso', req.url));
    return withSupabaseCookies(res, r);
  }

  // If route doesn't need a role, just continue (login pages stay public)
  if (!need) return res;

  // Not logged in → send to the correct portal login, keep return path
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = need === 'sau' ? '/portal/sau' : '/portal/auso';
    url.searchParams.set('redirectedFrom', path);
    const r = NextResponse.redirect(url);
    return withSupabaseCookies(res, r);
  }

  // Logged in but wrong role → 403 (or swap to redirect to the other portal if you prefer)
  if (role !== need) {
    const url = req.nextUrl.clone();
    url.pathname = '/403';
    url.searchParams.set('reason', `${need}_only`);
    const r = NextResponse.redirect(url);
    return withSupabaseCookies(res, r);
  }

  // Authorized
  return res;
}

// Run only where needed; include portal pages for the auto-bounce UX
export const config = {
  matcher: ['/sau/:path*', '/auso/:path*', '/portal/sau', '/portal/auso'],
};
