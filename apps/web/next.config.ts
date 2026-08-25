import type { NextConfig } from 'next';

const gatewayOrigin = (process.env.API_GATEWAY_URL ?? 'http://localhost:3001').replace(
  /\/$/,
  '',
);

const isProd = process.env.NODE_ENV === 'production';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com${isProd ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.razorpay.com https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://api.cloudinary.com",
  "frame-src https://api.razorpay.com",
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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
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
