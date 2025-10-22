import type { MetadataRoute } from 'next';
import { mockLocalFishStoresData } from '@/types';
import { supabase } from '@/lib/supabase';

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
  // In mock mode, use mock data. In real mode, optionally fetch slugs from DB
  // when SITEMAP_FETCH_STORES is not 'false'. Errors are swallowed to avoid
  // build-time coupling.
  const isMock = process.env.USE_MOCK_DATA !== 'false';
  let storeEntries: MetadataRoute.Sitemap = [];
  if (isMock) {
    storeEntries = mockLocalFishStoresData.slice(0, 25).map((s) => ({
      url: new URL(`/local-fish-stores/${s.slug}`, baseUrl).toString(),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } else if (process.env.SITEMAP_FETCH_STORES !== 'false') {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('slug')
        .eq('is_active', true)
        .limit(500);
      if (!error && data) {
        storeEntries = data.map((row: { slug: string }) => ({
          url: new URL(`/local-fish-stores/${row.slug}`, baseUrl).toString(),
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.6,
        }));
      }
    } catch {
      // noop – fall back to core routes only
    }
  }

  return [...core, ...storeEntries];
}
