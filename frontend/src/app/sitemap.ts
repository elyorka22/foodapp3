import type { MetadataRoute } from 'next';
import { getSitemapPaths } from '@/lib/sitemap-data';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await getSitemapPaths();
  const now = new Date();

  return paths.map((path) => ({
    url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path.startsWith('/restaurants/') ? 0.8 : 0.6,
  }));
}
