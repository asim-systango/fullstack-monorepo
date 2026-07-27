import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string | string[];
  details?: Array<{ field: string; message: string }>;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'Unexpected error';
    let details: ApiErrorBody['details'];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
        error = HttpStatus[status] ?? error;
      } else if (body && typeof body === 'object') {
        const record = body as Record<string, unknown>;
        error = typeof record.error === 'string' ? record.error : error;
        if (Array.isArray(record.message)) {
          message = record.message.map(String);
          details = message.map((m) => ({ field: 'request', message: m }));
        } else if (typeof record.message === 'string') {
          message = record.message;
        }
      }
    } else if (exception instanceof Error) {
      message =
        process.env.NODE_ENV === 'production' ? 'Unexpected error' : exception.message;
      this.logger.error(exception.message, exception.stack);
    }

    const payload: ApiErrorBody = {
      statusCode: status,
      error,
      message,
      details,
    };

    res.status(status).json(payload);
  }
}
