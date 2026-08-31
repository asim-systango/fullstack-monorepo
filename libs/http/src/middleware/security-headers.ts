import type { NextFunction, Request, Response } from 'express';

export type SecurityHeadersOptions = {
  /** When true, send HSTS (use behind HTTPS / when cookies are secure). */
  hsts?: boolean;
};

const BASELINE_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'";

/** Baseline browser/security headers for Nest HTTP apps. */
export function securityHeadersMiddleware(options: SecurityHeadersOptions = {}) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', BASELINE_CSP);
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (options.hsts) {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    next();
  };
}
