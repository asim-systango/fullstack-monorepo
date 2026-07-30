import type { Request, Response } from 'express';
import { requestIdMiddleware, REQUEST_ID_HEADER } from './request-id';

describe('requestIdMiddleware', () => {
  it('generates a correlation id when none is provided', () => {
    const req = { headers: {} } as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;

    requestIdMiddleware()(req, res, jest.fn());

    expect((req as { correlationId?: string }).correlationId).toBeTruthy();
    expect(res.setHeader).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      (req as { correlationId?: string }).correlationId,
    );
  });

  it('reuses an incoming x-request-id header', () => {
    const req = { headers: { [REQUEST_ID_HEADER]: 'trace-abc' } } as unknown as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;

    requestIdMiddleware()(req, res, jest.fn());

    expect((req as { correlationId?: string }).correlationId).toBe('trace-abc');
    expect(res.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, 'trace-abc');
  });
});
