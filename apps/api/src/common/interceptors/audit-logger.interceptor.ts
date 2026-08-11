import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuditLogData {
  correlationId: string;
  method: string;
  url: string;
  statusCode: number;
  userId?: string;
  role?: string;
  ip?: string;
  durationMs: number;
}

@Injectable()
export class AuditLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('SecurityAudit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const res = httpContext.getResponse();

    const startTime = Date.now();
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

    req.headers['x-correlation-id'] = correlationId;
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('X-Correlation-ID', correlationId);
    }

    const user = req.user;
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const statusCode = res?.statusCode || 200;
          this.logAudit({
            correlationId,
            method: req.method,
            url: req.url,
            statusCode,
            userId: user?.id || user?.sub,
            role: user?.role,
            ip,
            durationMs,
          });
        },
        error: (error: { status?: number; statusCode?: number }) => {
          const durationMs = Date.now() - startTime;
          const statusCode = error.status || error.statusCode || 500;
          this.logAudit({
            correlationId,
            method: req.method,
            url: req.url,
            statusCode,
            userId: user?.id || user?.sub,
            role: user?.role,
            ip,
            durationMs,
          });
        },
      }),
    );
  }

  private logAudit(data: AuditLogData): void {
    const logPayload = JSON.stringify(data);
    if (data.statusCode >= 500) {
      this.logger.error(`[AUDIT_ERROR] ${logPayload}`);
    } else if (data.statusCode >= 400) {
      this.logger.warn(`[AUDIT_WARN] ${logPayload}`);
    } else {
      this.logger.log(`[AUDIT_INFO] ${logPayload}`);
    }
  }
}
