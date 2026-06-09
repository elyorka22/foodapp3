import type { Metadata } from 'next';

export const SITE_URL = 'https://foodapp.uz';

export const SITE_NAME = 'FoodApp';

export const DEFAULT_TITLE = 'FoodApp - Restoranlardan taom yetkazib berish xizmati';

export const DEFAULT_DESCRIPTION =
  'restoranlardan ovqat buyurtma qiling. FoodApp orqali tez va qulay yetkazib berish xizmati.';

export const SEO_KEYWORDS = [
  'food delivery',
  'foodapp',
  'chust',
  'ovqat yetkazib berish',
  'restoranlar',
  'dostavka',
  'taom yetkazib berish',
  'restoran buyurtma',
  'FoodApp Uzbekistan',
];

export const OG_IMAGE = `${SITE_URL}/logo.png`;

type PageSeoOptions = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function canonicalUrl(path = ''): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return SITE_URL;
  return `${SITE_URL}${normalized}`;
}

export function buildPageMetadata(options: PageSeoOptions = {}): Metadata {
  const title = options.title ?? DEFAULT_TITLE;
  const description = options.description ?? DEFAULT_DESCRIPTION;
  const url = canonicalUrl(options.path ?? '');
  const robots = options.noIndex ? { index: false, follow: false } : { index: true, follow: true };

  return {
    title,
    description,
    keywords: SEO_KEYWORDS,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots,
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    openGraph: {
      type: 'website',
      locale: 'uz_UZ',
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: OG_IMAGE, width: 512, height: 512, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: OG_IMAGE,
  email: 'support@foodapp.uz',
  areaServed: {
    '@type': 'City',
    name: 'Chust',
  },
};

export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  url: SITE_URL,
  image: OG_IMAGE,
  description: DEFAULT_DESCRIPTION,
  email: 'support@foodapp.uz',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Chust',
    addressCountry: 'UZ',
  },
  areaServed: {
    '@type': 'City',
    name: 'Chust',
  },
  servesCuisine: 'Various',
};
