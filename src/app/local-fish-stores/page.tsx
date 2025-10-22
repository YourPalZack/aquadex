
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

  const result = await searchStoresAction({ q, categories: filteredCategories, limit, offset });
  const stores = result.success ? (result as any).data.stores : [];
  const total = result.success ? (result as any).data.total_count : 0;
  const hasMore = result.success ? (result as any).data.has_more : false;
  const showingStart = stores.length > 0 ? offset + 1 : 0;
  const showingEnd = offset + stores.length;

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
        defaultValues={{ q, categories: filteredCategories, radius: isNaN(radius) ? undefined : radius, pageSize: limit }}
        onSearch={() => { /* navigation handled inside form via router.push */ }}
      />

      <StoreMap stores={stores as any} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {total > 0 ? (
            <span>Showing {showingStart}-{showingEnd} of {total} stores</span>
          ) : (
            <span>No results</span>
          )}
        </div>
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
                if (limit) params.set('pageSize', String(limit));
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
                if (limit) params.set('pageSize', String(limit));
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

export default function LocalFishStoresPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div className="h-64" />}>{/* lightweight fallback */}
        <DirectoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

    