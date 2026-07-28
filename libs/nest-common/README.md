# @repo/nest-common

Shared Nest HTTP helpers used by **api-gateway** and **api**:

- `ResponseEnvelopeInterceptor` — success `{ data: T }`
- `AllExceptionsFilter` + `validationExceptionFactory` — error `{ statusCode, error, message, details? }`
