import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';

const PROTECTED_PREFIXES = ['/my', '/seller', '/admin', '/watchlist'] as const;

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Cookie presence ≠ valid session — logged-in /login|/register redirect is
  // handled client-side after /auth/me succeeds (see LoginForm / RegisterForm).
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (isProtected(pathname) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    const next = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/my/:path*',
    '/seller/:path*',
    '/admin/:path*',
    '/watchlist',
    '/watchlist/:path*',
  ],
};
