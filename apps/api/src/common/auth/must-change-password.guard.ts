import {
  ForbiddenException,
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from '../../modules/users/users.service';

const ALLOWED_WHILE_MUST_CHANGE: ReadonlyArray<{ method: string; path: string }> = [
  { method: 'POST', path: '/auth/change-password' },
  { method: 'GET', path: '/auth/me' },
  { method: 'POST', path: '/auth/logout' },
  { method: 'POST', path: '/auth/refresh' },
];

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: { id?: string } }>();
    const userId = request.user?.id;
    if (!userId) return true;

    const method = request.method.toUpperCase();
    const rawPath = request.path || '/';
    const path =
      rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
    if (
      ALLOWED_WHILE_MUST_CHANGE.some((rule) => rule.method === method && rule.path === path)
    ) {
      return true;
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    if (user.mustChangePassword) {
      throw new ForbiddenException('You must change your password before continuing');
    }
    return true;
  }
}
