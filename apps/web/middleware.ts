import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Pass-through middleware placeholder for future auth/route guards. */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
