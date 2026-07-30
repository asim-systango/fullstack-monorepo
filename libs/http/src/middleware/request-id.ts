import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

export type RequestWithCorrelationId = Request & { correlationId?: string };

function readIncomingRequestId(req: Request): string | undefined {
  const value = req.headers[REQUEST_ID_HEADER];
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (Array.isArray(value) && value[0]?.trim()) return value[0].trim();
  return undefined;
}

/** Attach a correlation id to each request/response for distributed tracing. */
export function requestIdMiddleware() {
  return (req: RequestWithCorrelationId, res: Response, next: NextFunction) => {
    const correlationId = readIncomingRequestId(req) ?? randomUUID();
    req.correlationId = correlationId;
    res.setHeader(REQUEST_ID_HEADER, correlationId);
    next();
  };
}
