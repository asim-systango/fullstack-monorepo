import { securityHeadersMiddleware } from './security-headers';
import type { Request, Response } from 'express';

describe('securityHeadersMiddleware', () => {
  it('sets baseline headers', () => {
    const setHeader = jest.fn();
    const next = jest.fn();
    securityHeadersMiddleware()(
      {} as Request,
      { setHeader } as unknown as Response,
      next,
    );

    expect(setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(setHeader).toHaveBeenCalledWith('Referrer-Policy', 'no-referrer');
    expect(next).toHaveBeenCalled();
  });

  it('optionally sets HSTS', () => {
    const setHeader = jest.fn();
    securityHeadersMiddleware({ hsts: true })(
      {} as Request,
      { setHeader } as unknown as Response,
      jest.fn(),
    );
    expect(setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      'max-age=15552000; includeSubDomains',
    );
  });
});
