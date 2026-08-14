import { NextResponse, type NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  AUTH_LOGIN_PATH,
  AUTH_UNAUTHORIZED_PATH,
} from '@/lib/auth/constants';
import { decodeAccessToken } from '@/lib/auth/jwt';
import { evaluateRouteAccess } from '@/lib/routes/access';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? decodeAccessToken(token) : null;
  const role = payload?.role ?? null;

  const gate = evaluateRouteAccess(pathname, role);

  if (gate.status === 'allow' || gate.status === 'unknown') {
    return NextResponse.next();
  }

  if (gate.status === 'login') {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = AUTH_LOGIN_PATH;
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const forbiddenUrl = request.nextUrl.clone();
  forbiddenUrl.pathname = AUTH_UNAUTHORIZED_PATH;
  forbiddenUrl.search = '';
  return NextResponse.redirect(forbiddenUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
