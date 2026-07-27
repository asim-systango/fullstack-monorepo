import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/api-client', '@repo/shared-types'],
};

export default nextConfig;
