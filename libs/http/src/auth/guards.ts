import {
  Injectable,
  CanActivate,
  UnauthorizedException,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { Request } from 'express';
import type { AuthPrincipal, UserRole } from './types';
import { IS_PUBLIC_KEY, ROLES_KEY } from './keys';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const result = super.canActivate(context);
    if (!isPublic) return result;

    // Public routes: attempt JWT so request.user is set when a token exists,
    // but never block anonymous access.
    if (result instanceof Observable) {
      return result.pipe(
        map(() => true),
        catchError(() => of(true)),
      );
    }
    if (result instanceof Promise) {
      return result.then(() => true).catch(() => true);
    }
    return true;
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser | null {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return user ?? null;
    }
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthPrincipal }>();
    const user = request.user;
    if (!user) throw new UnauthorizedException();
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
