import type { MetadataRoute } from 'next';
import { mockLocalFishStoresData } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    '/',
    '/dashboard',
    '/aiquarium-tools',
    '/analyze',
    '/qa',
    '/marketplace',
    '/items-wanted',
    '/for-fishkeepers',
    '/for-breeders-sellers',
    '/for-brands-stores',
    '/local-fish-stores',
    '/sitemap',
  ].map((path) => ({
    url: new URL(path, baseUrl).toString(),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));

  // Include some store profile pages.
  // In mock mode, use mock data; in real mode we omit here to avoid coupling build
  // to DB; a separate job can enrich the sitemap if desired.
  const isMock = process.env.USE_MOCK_DATA !== 'false';
  const storeEntries: MetadataRoute.Sitemap = isMock
    ? mockLocalFishStoresData.slice(0, 25).map((s) => ({
        url: new URL(`/local-fish-stores/${s.slug}`, baseUrl).toString(),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    : [];

  return [...core, ...storeEntries];
}
