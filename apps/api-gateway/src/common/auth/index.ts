/** Gateway-local auth surface — hand-built guards/decorators, not @shared/http/auth. */
export { CurrentUser } from '../decorators/current-user.decorator';
export { IS_PUBLIC_KEY, Public } from '../decorators/public.decorator';
export { Roles, ROLES_KEY } from '../decorators/roles.decorator';
export { RolesGuard } from '../guards/roles.guard';
