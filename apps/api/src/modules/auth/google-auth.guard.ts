import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { loadApiEnv } from '../../common/env';
import { safeAppPath } from './oauth-path.util';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super({ session: false });
  }

  override getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    if (typeof req.query.code === 'string' || typeof req.query.error === 'string') {
      return { session: false };
    }
    const returnUrl = typeof req.query.returnUrl === 'string' ? req.query.returnUrl : '';
    return {
      session: false,
      state: encodeURIComponent(safeAppPath(returnUrl)),
    };
  }

  override canActivate(context: ExecutionContext) {
    const env = loadApiEnv();
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new ServiceUnavailableException('Google login is not configured');
    }
    return super.canActivate(context);
  }

  override handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const env = loadApiEnv();
      const res = context.switchToHttp().getResponse<Response>();
      if (!res.headersSent) {
        res.redirect(`${env.APP_PUBLIC_URL.replace(/\/$/, '')}/login?error=google`);
      }
      throw err || new UnauthorizedException('Google authentication failed');
    }
    return user;
  }
}
