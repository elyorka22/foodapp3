import type { NextConfig } from 'next';
// next-pwa@5.6.0 — keep precache lean (customer shell only)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // Do not precache admin/business/courier panels on first visit
  exclude: [
    /\/admin(?:\/|$)/,
    /\/business(?:\/|$)/,
    /\/courier(?:\/|$)/,
    /middleware-manifest\.json$/,
  ],
});

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/restaurant', destination: '/business', permanent: true },
      { source: '/restaurant/:path*', destination: '/business/:path*', permanent: true },
      { source: '/products', destination: '/', permanent: true },
      { source: '/shops', destination: '/', permanent: true },
      { source: '/shops/category/:slug', destination: '/', permanent: true },
    ];
  },
  images: {
    // Spaces CDN + any https host used for merchant uploads
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default withPWA(nextConfig);
