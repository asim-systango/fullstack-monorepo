/** Re-exports `@shared/http/auth` for app imports (`./common/auth`). */
export {
  CurrentUser,
  IS_PUBLIC_KEY,
  JwtAuthGuard,
  Public,
  Roles,
  RolesGuard,
  ROLES_KEY,
  type AuthPrincipal,
  type UserRole,
} from '@shared/http/auth';

export { MustChangePasswordGuard } from './must-change-password.guard';
export type { JwtUser } from './jwt-user';
