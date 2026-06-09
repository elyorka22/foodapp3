import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { SiteJsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = buildPageMetadata();

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <SiteJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
