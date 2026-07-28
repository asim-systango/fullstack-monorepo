import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserRole } from './types';
import { IS_PUBLIC_KEY, ROLES_KEY } from './keys';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Roles: admin | user | staff (rename `staff` for your domain). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<{ user?: unknown }>();
    return request.user;
  },
);
