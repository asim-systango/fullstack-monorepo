import { CookieOptions } from 'express';

export const access_token = 'access_token';

export function getAuthCookieOptions(secure: boolean, maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}
