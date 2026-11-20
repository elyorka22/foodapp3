import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { SiteJsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata();

export const viewport: Viewport = {
  themeColor: '#18181B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <SiteJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
