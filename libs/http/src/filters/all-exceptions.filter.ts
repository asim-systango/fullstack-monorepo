import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  ValidationError,
} from '@nestjs/common';
import type { Response } from 'express';

type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string | string[];
  details?: Array<{ field: string; message: string }>;
};

type FieldDetail = { field: string; message: string };

function isFieldDetails(value: unknown): value is FieldDetail[] {
  return (
    Array.isArray(value) &&
    value.every(
      (d) =>
        d &&
        typeof d === 'object' &&
        typeof (d as { field?: unknown }).field === 'string' &&
        typeof (d as { message?: unknown }).message === 'string',
    )
  );
}

function fromHttpExceptionBody(
  body: string | object,
  status: number,
): Omit<ApiErrorBody, 'statusCode'> {
  if (typeof body === 'string') {
    return {
      error: HttpStatus[status] ?? 'Error',
      message: body,
    };
  }

  const record = body as Record<string, unknown>;
  const error = typeof record.error === 'string' ? record.error : 'Error';

  if (isFieldDetails(record.details)) {
    return {
      error,
      details: record.details,
      message: Array.isArray(record.message)
        ? record.message.map(String)
        : record.details.map((d) => d.message),
    };
  }

  if (Array.isArray(record.message)) {
    const message = record.message.map(String);
    return {
      error,
      message,
      details: message.map((m) => ({ field: 'request', message: m })),
    };
  }

  if (typeof record.message === 'string') {
    return { error, message: record.message };
  }

  return { error, message: 'Unexpected error' };
}

export function flattenValidationErrors(
  errors: ValidationError[],
  parent = '',
): FieldDetail[] {
  const details: FieldDetail[] = [];
  for (const err of errors) {
    const field = parent ? `${parent}.${err.property}` : err.property;
    if (err.constraints) {
      for (const message of Object.values(err.constraints)) {
        details.push({ field, message });
      }
    }
    if (err.children?.length) {
      details.push(...flattenValidationErrors(err.children, field));
    }
  }
  return details;
}

/** Nest ValidationPipe exceptionFactory that preserves field names. */
export function validationExceptionFactory(errors: ValidationError[]) {
  const details = flattenValidationErrors(errors);
  return new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    error: 'Bad Request',
    message: details.map((d) => d.message),
    details,
  });
}

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
      ({ error, message, details } = fromHttpExceptionBody(
        exception.getResponse(),
        status,
      ));
    } else if (exception instanceof Error) {
      message =
        process.env.NODE_ENV === 'production' ? 'Unexpected error' : exception.message;
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error('Non-Error exception thrown', String(exception));
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
