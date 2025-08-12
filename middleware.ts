import { NextRequest, NextResponse } from 'next/server';

const ROLE_COOKIE = 'au_role';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = pathname.startsWith('/sau') || pathname.startsWith('/auso');
  if (!isProtected) return NextResponse.next();

  const role = req.cookies.get(ROLE_COOKIE)?.value;
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = '/public/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Optionally restrict cross-access; for now, either role may view both.
  return NextResponse.next();
}

export const config = {
  matcher: ['/sau/:path*', '/auso/:path*']
};