import type { NextConfig } from 'next';

/**
 * Browser calls same-origin `/api/*` on :3000.
 * Next rewrites those to the Nest API gateway (default :3001).
 */
const gatewayOrigin = (process.env.API_GATEWAY_URL ?? 'http://localhost:3001').replace(
  /\/$/,
  '',
);

const nextConfig: NextConfig = {
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
