import type { NextConfig } from 'next';

/**
 * Browser calls same-origin `/api/*` on :3000.
 * Next rewrites those to the Nest API gateway (default :3001).
 */
const gatewayOrigin = (process.env.API_GATEWAY_URL ?? 'http://localhost:3001').replace(
  /\/$/,
  '',
);

const isProd = process.env.NODE_ENV === 'production';

/**
 * Browser-facing security headers. The Nest apps set their own via
 * `@shared/http/middleware`, but those serve JSON — this is the only tier that
 * returns HTML, so it is the only one where CSP meaningfully limits XSS.
 *
 * Caveat: `script-src 'unsafe-inline'` is required because the App Router inlines
 * hydration/flight scripts. That weakens CSP against injected inline scripts. To
 * harden further, emit a per-request nonce from `middleware.ts` and swap
 * `'unsafe-inline'` for `'nonce-<value>'`; `'unsafe-eval'` is dev-only (HMR).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=15552000; includeSubDomains',
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@shared/ui', '@shared/api-client', '@shared/types'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${gatewayOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
