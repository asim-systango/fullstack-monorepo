import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';

/** Routes that need a logged-in user (cookie JWT from api-gateway). */
const PROTECTED_PREFIXES = ['/cart', '/orders', '/restaurant', '/admin'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const mockMode = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  // Already signed in → keep them off the auth screens.
  // In mock mode sessions live in localStorage, so skip this redirect.
  if (!mockMode && (pathname === '/login' || pathname === '/register') && hasSession) {
    return NextResponse.redirect(new URL('/restaurants', request.url));
  }

  // Private pages need the gateway auth cookie (real API mode only).
  if (!mockMode && isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/cart',
    '/cart/:path*',
    '/orders',
    '/orders/:path*',
    '/restaurant/:path*',
    '/admin',
    '/admin/:path*',
  ],
};
