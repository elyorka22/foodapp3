import type { NextConfig } from 'next';
// next-pwa@5.6.0 — only documented keys (no workboxOptions / aggressiveFrontEndNavCaching)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default withPWA(nextConfig);
