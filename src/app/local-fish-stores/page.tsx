
import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Store } from 'lucide-react';
import { StoreSearchForm, StoreCard, StoreMap } from '@/components/local-fish-stores';
import { searchStoresAction } from '@/lib/actions/store-supabase';

type SearchParams = { [key: string]: string | string[] | undefined };

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(',').filter(Boolean);
}

async function DirectoryContent({ searchParams }: { searchParams: SearchParams }) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const categories = toArray(searchParams.categories as any);
  const allowedCats = new Set(['freshwater','saltwater','plants','reptiles','general']);
  const filteredCategories = categories.filter((c) => allowedCats.has(c)) as (
    'freshwater' | 'saltwater' | 'plants' | 'reptiles' | 'general'
  )[];
  const page = Number(searchParams.page ?? '1') || 1;
  const pageSizeParam = Number(searchParams.pageSize ?? '24');
  const limit = pageSizeParam && pageSizeParam > 0 ? Math.min(Math.max(pageSizeParam, 6), 60) : 24;
  const offset = (page - 1) * limit;
  const radius = Number(searchParams.radius ?? '');
  const lat = Number(searchParams.lat ?? '');
  const lng = Number(searchParams.lng ?? '');
  const sort = typeof searchParams.sort === 'string' && (searchParams.sort === 'nearest' || searchParams.sort === 'latest')
    ? searchParams.sort
    : 'latest';

  const result = await searchStoresAction({ q, categories: filteredCategories, limit, offset, lat: isNaN(lat) ? undefined : lat, lng: isNaN(lng) ? undefined : lng, radius: isNaN(radius) ? undefined : radius, sort_by: sort as any });
  const stores = result.success ? (result as any).data.stores : [];
  const total = result.success ? (result as any).data.total_count : 0;
  const hasMore = result.success ? (result as any).data.has_more : false;
  const showingStart = stores.length > 0 ? offset + 1 : 0;
  const showingEnd = offset + stores.length;
  const hasLocation = !isNaN(lat) && !isNaN(lng);
  const activeFiltersCount = (
    (q ? 1 : 0) +
    (filteredCategories.length) +
    (hasLocation ? 1 : 0) +
    (!isNaN(radius) && hasLocation ? 1 : 0)
  );

  return (
    <div className="space-y-6">
      <Card className="bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center text-primary">
            <Store className="w-8 h-8 mr-3" />
            Local Fish Stores
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 pt-2">
            Find aquarium stores in your area. Search by name, city, state, zip, or specialties.
          </CardDescription>
        </CardHeader>
      </Card>

      <StoreSearchForm
        defaultValues={{
          q,
          categories: filteredCategories,
          radius: isNaN(radius) ? undefined : radius,
          latitude: isNaN(lat) ? undefined : lat,
          longitude: isNaN(lng) ? undefined : lng,
          pageSize: limit,
          sortBy: sort as any,
        }}
        onSearch={() => { /* navigation handled inside form via router.push */ }}
      />

  <StoreMap stores={stores as any} userLatitude={isNaN(lat) ? undefined : lat} userLongitude={isNaN(lng) ? undefined : lng} />

      {/* Active filters */}
      {(q || filteredCategories.length > 0 || (!isNaN(radius) && hasLocation) || hasLocation) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold mr-1">Filters{activeFiltersCount ? ` (${activeFiltersCount})` : ''}:</span>
          {/* Query chip */}
          {q && (
            <Link
              className="px-2 py-1 rounded border hover:bg-muted"
              href={(() => {
                const params = new URLSearchParams();
                if (filteredCategories.length) params.set('categories', filteredCategories.join(','));
                if (!isNaN(radius) && hasLocation) params.set('radius', String(radius));
                if (!isNaN(lat) && !isNaN(lng)) { params.set('lat', String(lat)); params.set('lng', String(lng)); }
                if (limit) params.set('pageSize', String(limit));
                if (sort) params.set('sort', sort);
                params.set('page', '1');
                return `/local-fish-stores?${params.toString()}`;
              })()}
            >
              “{q}” ×
            </Link>
          )}

          {/* Category chips */}
          {filteredCategories.map((c) => (
            <Link
              key={c}
              className="px-2 py-1 rounded border hover:bg-muted"
              href={(() => {
                const params = new URLSearchParams();
                const cats = filteredCategories.filter((x) => x !== c);
                if (cats.length) params.set('categories', cats.join(','));
                if (q) params.set('q', q);
                if (!isNaN(radius) && hasLocation) params.set('radius', String(radius));
                if (!isNaN(lat) && !isNaN(lng)) { params.set('lat', String(lat)); params.set('lng', String(lng)); }
                if (limit) params.set('pageSize', String(limit));
                if (sort) params.set('sort', sort);
                params.set('page', '1');
                return `/local-fish-stores?${params.toString()}`;
              })()}
            >
              {c} ×
            </Link>
          ))}

          {/* Radius chip (only meaningful with location) */}
          {!isNaN(radius) && hasLocation && (
            <Link
              className="px-2 py-1 rounded border hover:bg-muted"
              href={(() => {
                const params = new URLSearchParams();
                if (q) params.set('q', q);
                if (filteredCategories.length) params.set('categories', filteredCategories.join(','));
                if (!isNaN(lat) && !isNaN(lng)) { params.set('lat', String(lat)); params.set('lng', String(lng)); }
                if (limit) params.set('pageSize', String(limit));
                if (sort) params.set('sort', sort);
                params.set('page', '1');
                return `/local-fish-stores?${params.toString()}`;
              })()}
            >
              within {radius} mi ×
            </Link>
          )}

          {/* Location chip */}
          {hasLocation && (
            <Link
              className="px-2 py-1 rounded border hover:bg-muted"
              href={(() => {
                const params = new URLSearchParams();
                if (q) params.set('q', q);
                if (filteredCategories.length) params.set('categories', filteredCategories.join(','));
                // remove lat/lng and radius
                if (limit) params.set('pageSize', String(limit));
                if (sort) params.set('sort', sort);
                params.set('page', '1');
                return `/local-fish-stores?${params.toString()}`;
              })()}
            >
              using your location ×
            </Link>
          )}

          {/* Clear all */}
          <Link className="px-2 py-1 rounded border hover:bg-muted" href="/local-fish-stores">Clear all</Link>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {total > 0 ? (
            <span>
              Showing {showingStart}-{showingEnd} of {total} stores
              {hasLocation && !isNaN(radius) ? ` within ${radius} mi` : ''}
            </span>
          ) : (
            <span>No results</span>
          )}
        </div>
        {hasLocation && (
          <div className="text-xs text-muted-foreground/80">Distances shown from your location</div>
        )}
      </div>

      {stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((s: any) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-10">
            <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-xl font-semibold mb-2">No Stores Found</p>
            <p>
              There are currently no stores to display. Once your database is configured, results will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {total > limit && (
        <div className="flex items-center justify-center gap-4 pt-2">
          {/* Prev */}
          {page > 1 ? (
            <Link
              className="px-3 py-2 rounded border bg-background hover:bg-muted text-sm"
              href={((): string => {
                const params = new URLSearchParams();
                if (q) params.set('q', q);
                if (filteredCategories.length) params.set('categories', filteredCategories.join(','));
                if (!isNaN(radius)) params.set('radius', String(radius));
                if (!isNaN(lat) && !isNaN(lng)) { params.set('lat', String(lat)); params.set('lng', String(lng)); }
                if (limit) params.set('pageSize', String(limit));
                if (sort) params.set('sort', sort);
                params.set('page', String(page - 1));
                return `/local-fish-stores?${params.toString()}`;
              })()}
            >
              Previous
            </Link>
          ) : (
            <span className="px-3 py-2 rounded border text-muted-foreground/60 text-sm cursor-not-allowed">Previous</span>
          )}

          <span className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>

          {/* Next */}
          {hasMore ? (
            <Link
              className="px-3 py-2 rounded border bg-background hover:bg-muted text-sm"
              href={((): string => {
                const params = new URLSearchParams();
                if (q) params.set('q', q);
                if (filteredCategories.length) params.set('categories', filteredCategories.join(','));
                if (!isNaN(radius)) params.set('radius', String(radius));
                if (!isNaN(lat) && !isNaN(lng)) { params.set('lat', String(lat)); params.set('lng', String(lng)); }
                if (limit) params.set('pageSize', String(limit));
                if (sort) params.set('sort', sort);
                params.set('page', String(page + 1));
                return `/local-fish-stores?${params.toString()}`;
              })()}
            >
              Next
            </Link>
          ) : (
            <span className="px-3 py-2 rounded border text-muted-foreground/60 text-sm cursor-not-allowed">Next</span>
          )}
        </div>
      )}

      <Alert variant="default" className="mt-2 bg-muted/50 border-border">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-muted-foreground font-semibold">Please Note</AlertTitle>
        <AlertDescription className="text-muted-foreground/80">
          The map will show markers once store coordinates are available. Distance-based search will be enabled after migrations.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  const q = typeof searchParams.q === 'string' && searchParams.q.trim().length ? searchParams.q.trim() : '';
  const cats = typeof searchParams.categories === 'string' ? searchParams.categories.split(',').filter(Boolean) : [];
  const page = Number(searchParams.page ?? '1') || 1;

  const parts: string[] = ['Local Fish Stores'];
  if (q) parts.push(`“${q}”`);
  if (cats.length) parts.push(`${cats.join(', ')}`);
  if (page > 1) parts.push(`Page ${page}`);

  const title = parts.join(' · ');
  const description = q || cats.length
    ? `Browse aquarium stores${q ? ` matching “${q}”` : ''}${cats.length ? ` in ${cats.join(', ')}` : ''}.`
    : 'Find aquarium stores near you. Search by name, city, state, zip, and specialties.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  } as const;
}

export default function LocalFishStoresPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div className="h-64" />}>{/* lightweight fallback */}
        <DirectoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

    