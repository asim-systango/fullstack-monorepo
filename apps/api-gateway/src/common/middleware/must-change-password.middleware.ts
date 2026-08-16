import type { JwtService } from '@nestjs/jwt';
import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import type { UsersService } from '../../modules/users/users.service';

/** Routes still allowed while mustChangePassword is true. */
function isPasswordChangeAllowed(method: string, path: string): boolean {
  const m = method.toUpperCase();
  if (m === 'POST' && path === '/auth/change-password') return true;
  if (m === 'GET' && path === '/auth/me') return true;
  if (m === 'POST' && path === '/auth/logout') return true;
  return false;
}

/**
 * Express middleware (runs before the domain proxy) so both gateway Nest routes
 * and proxied apps/api routes enforce mustChangePassword in one place.
 */
export function createMustChangePasswordMiddleware(
  usersService: UsersService,
  jwtService: JwtService,
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (isPasswordChangeAllowed(req.method, req.path)) {
      next();
      return;
    }

    const cookies = req.cookies as Record<string, string> | undefined;
    const token = cookies?.[AUTH_COOKIE_NAME];
    if (!token) {
      next();
      return;
    }

    try {
      const payload = await jwtService.verifyAsync<{ sub: string }>(token);
      const user = await usersService.findById(payload.sub);
      if (user?.mustChangePassword) {
        res.status(403).json({
          statusCode: 403,
          error: 'Forbidden',
          message: 'must change password before continuing',
        });
        return;
      }
    } catch {
      // Invalid/expired cookie — JwtAuthGuard or upstream returns 401.
    }

    next();
  };
}
