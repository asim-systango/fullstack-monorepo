import type { NextFunction, Request, Response } from 'express';

export type SecurityHeadersOptions = {
  /** When true, send HSTS (use behind HTTPS / when cookies are secure). */
  hsts?: boolean;
};

/** Baseline browser/security headers for Nest HTTP apps. */
export function securityHeadersMiddleware(options: SecurityHeadersOptions = {}) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (options.hsts) {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    next();
  };
}
