
import { Suspense } from 'react';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Store } from 'lucide-react';
import { StoreSearchForm, StoreCard, StoreMap } from '@/components/local-fish-stores';
import { searchStoresAction } from '@/lib/actions/store-supabase';

async function DirectoryContent() {
  const result = await searchStoresAction({ limit: 24, offset: 0 });
  const stores = result.success ? (result as any).data.stores : [];

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

      <StoreSearchForm onSearch={() => { /* TODO: wire client navigation with URL params */ }} />

      <StoreMap stores={stores as any} />

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

export default function LocalFishStoresPage() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div className="h-64" />}>{/* lightweight fallback */}
        <DirectoryContent />
      </Suspense>
    </div>
  );
}

    