import { Suspense } from 'react';
import { getWaterTests } from '@/lib/actions/water-test';
import { getAquariums } from '@/lib/actions/aquarium';
import { WaterTestsPageContent } from '@/components/aquariums/water-tests-page-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Loader2 } from 'lucide-react';

export default async function WaterTestsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <Droplet className="h-8 w-8 mr-3 text-primary" />
          Water Test History
        </h1>
        <p className="text-muted-foreground">
          View and manage all your water quality test results across all aquariums.
        </p>
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