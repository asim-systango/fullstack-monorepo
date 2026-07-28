/**
 * App-local auth barrel — re-exports shared guards/decorators so existing
 * `../../common/auth` imports keep working for the starter template.
 */
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
