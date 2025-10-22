import { Suspense } from 'react';
import { getWaterTests } from '@/lib/actions/water-test';
import { getAquariums } from '@/lib/actions/aquarium';
import { WaterTestCompareContent } from '@/components/aquariums/water-test-compare-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitCompareArrows, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default async function WaterTestComparePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Water Tests', href: '/water-tests' },
          { label: 'Compare' },
        ]}
        className="mb-4"
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <GitCompareArrows className="h-8 w-8 mr-3 text-primary" />
          Compare Water Tests
        </h1>
        <p className="text-muted-foreground">
          Select multiple water tests to compare parameters side by side and track changes over time.
        </p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <CompareTestsData />
      </Suspense>
    </div>
  );
}

async function CompareTestsData() {
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

  // Create aquarium lookup
  const aquariumLookup = aquariums.reduce((acc, aquarium) => {
    acc[aquarium.id] = aquarium.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <WaterTestCompareContent 
      waterTests={waterTests} 
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