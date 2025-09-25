import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ROLE_MAP: Record<string, 'sau' | 'auso'> = {
  '/sau': 'sau',
  '/portal/sau': 'sau',
  '/auso': 'auso',
  '/portal/auso': 'auso',
};

function requiredRoleFor(pathname: string): 'sau' | 'auso' | null {
  // Exact matches for landing pages
  // if (pathname === '/portal/sau') return 'sau';
  // if (pathname === '/portal/auso') return 'auso';
  // Prefix matches for sections
  if (pathname === '/sau' || pathname.startsWith('/sau/')) return 'sau';
  if (pathname == '/auso' || pathname.startsWith('/auso/')) return 'auso';
  return null;
}

// Helper: carry any Set-Cookie from the "res" (where Supabase writes) to a redirect response
function withSupabaseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c);
  });
  return to;
}

export async function middleware(req: NextRequest) {
  // Base response where Supabase will attach refreshed cookies if needed
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const neededRole = requiredRoleFor(path);

  // If route is not protected, just continue
  if (!neededRole) return res;

  // Unauthenticated → login with return path
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = '/public/login';
    url.searchParams.set('redirectedFrom', path);
    const redirect = NextResponse.redirect(url);
    return withSupabaseCookies(res, redirect);
  }

  // Authorized by role from app_metadata
  const role = (user.app_metadata?.role as string) ?? 'user';
  if (role !== neededRole) {
    const url = req.nextUrl.clone();
    url.pathname = '/403';
    url.searchParams.set('reason', `${neededRole}_only`);
    const redirect = NextResponse.redirect(url);
    return withSupabaseCookies(res, redirect);
  }

  // OK
  return res;
}

// Prefer a precise matcher so middleware only runs where needed
export const config = {
  matcher: ['/sau/:path*', '/auso/:path*', '/portal/sau', '/portal/auso'],
};
