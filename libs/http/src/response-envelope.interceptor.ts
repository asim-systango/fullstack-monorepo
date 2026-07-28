import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export type ResponseEnvelope<T> = {
  data: T;
};

/**
 * Wraps successful JSON responses as `{ data: T }`.
 * Errors stay unwrapped (see AllExceptionsFilter).
 * StreamableFile responses are left untouched.
 */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((body) => {
        if (body instanceof StreamableFile) return body;
        if (
          body !== null &&
          typeof body === 'object' &&
          'data' in body &&
          Object.keys(body).length === 1
        ) {
          return body;
        }
        return { data: body } satisfies ResponseEnvelope<unknown>;
      }),
    );
  }
}
