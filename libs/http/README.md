# @shared/http

Shared Nest HTTP helpers used by **api-gateway** and **api**. Prefer **folder subpaths** over the package root.

| Import                      | What you get                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `@shared/http/filters`      | `AllExceptionsFilter`, `validationExceptionFactory`, `flattenValidationErrors`                                        |
| `@shared/http/interceptors` | `ResponseEnvelopeInterceptor` — success `{ data: T }`                                                                 |
| `@shared/http/auth`         | JWT guards/decorators (`JwtAuthGuard`, `RolesGuard`, `Public`, `Roles`, `CurrentUser`) + `AuthPrincipal` / `UserRole` |
| `@shared/http/middleware`   | `securityHeadersMiddleware`                                                                                           |
| `@shared/http/swagger`      | `setupSwagger`                                                                                                        |
| `@shared/http`              | Thin re-export of all of the above (prefer folder paths)                                                              |

Nest apps usually re-export auth via `./common/auth` so controllers stay app-local:

```ts
import { Public, Roles } from './common/auth';
// which re-exports from '@shared/http/auth'
```

Envelope shape:

- Success — `{ data: T }` (`ResponseEnvelopeInterceptor`)
- Error — `{ statusCode, error, message, details? }` (`AllExceptionsFilter` + `validationExceptionFactory`)
