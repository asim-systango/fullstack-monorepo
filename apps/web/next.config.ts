import type { NextConfig } from 'next';

/**
 * Browser calls same-origin `/api/*` on :3006.
 * Next rewrites those to the Nest API gateway (default :3005).
 */
const gatewayOrigin = (process.env.API_GATEWAY_URL ?? 'http://localhost:3005').replace(
  /\/$/,
  '',
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@shared/ui', '@shared/api-client', '@shared/types'],
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
