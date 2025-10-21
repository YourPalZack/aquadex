import { Suspense } from 'react';
import { getWaterTests } from '@/lib/actions/water-test';
import { getAquariums } from '@/lib/actions/aquarium';
import { WaterTestsPageContent } from '@/components/aquariums/water-tests-page-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, Loader2, Beaker, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function WaterTestsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Droplet className="h-8 w-8 mr-3 text-primary" />
              Water Test History
            </h1>
            <p className="text-muted-foreground">
              View and manage all your water quality test results across all aquariums.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/water-tests/compare">
                <Plus className="h-4 w-4" />
                Compare Tests
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/water-tests/batch-entry">
                <Beaker className="h-4 w-4" />
                Batch Entry
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Suspense fallback={<LoadingState />}>
        <WaterTestsData />
      </Suspense>
    </div>
  );
}

async function WaterTestsData() {
  const [waterTestsResult, aquariumsResult] = await Promise.all([
    getWaterTests({}),
    getAquariums({}),
  ]);

  if (waterTestsResult.error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Error loading water tests: {waterTestsResult.error}
        </CardContent>
      </Card>
    );
  }

  if (aquariumsResult.error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Error loading aquariums: {aquariumsResult.error}
        </CardContent>
      </Card>
    );
  }

  const waterTests = waterTestsResult.waterTests || [];
  const aquariums = aquariumsResult.aquariums || [];

  // Create aquarium lookup for export
  const aquariumLookup = aquariums.reduce((acc, aquarium) => {
    acc[aquarium.id] = aquarium.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <WaterTestsPageContent 
      waterTests={waterTests} 
      aquariums={aquariums}
      aquariumLookup={aquariumLookup}
    />
  );
}

function LoadingState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading Water Tests</CardTitle>
      </CardHeader>
      <CardContent className="py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}