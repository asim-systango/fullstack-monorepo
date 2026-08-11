import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { INTERNAL_SERVICE_TOKEN_HEADER } from '@shared/env/constants';
import { loadApiEnv } from '../../common/env';

/**
 * Guards `/internal/*` routes — requires `X-Internal-Token` matching env.
 * Pair with `@Public()` so JWT is not required.
 */
@Injectable()
export class InternalTokenGuard implements CanActivate {
  private readonly expected = loadApiEnv().INTERNAL_SERVICE_TOKEN;

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers[INTERNAL_SERVICE_TOKEN_HEADER];
    const token = Array.isArray(header) ? header[0] : header;
    if (!token || token !== this.expected) {
      throw new UnauthorizedException('Invalid internal service token');
    }
    return true;
  }
}
