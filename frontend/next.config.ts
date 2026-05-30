import type { NextConfig } from 'next';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // Avoid caching client navigations — fixes 404 on dynamic routes like /restaurants/[slug]
  cacheOnFrontEndNav: false,
  workboxOptions: {
    navigateFallback: null,
    runtimeCaching: [
      {
        urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-network',
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default withPWA(nextConfig);
