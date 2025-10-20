import { notFound } from 'next/navigation';
import { getAquariumById } from '@/lib/actions/aquarium';
import { ManualTestForm } from '@/components/aquariums/manual-test-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Beaker } from 'lucide-react';
import Link from 'next/link';

interface ManualTestPageProps {
  params: {
    aquariumId: string;
  };
}

export default async function ManualTestPage({ params }: ManualTestPageProps) {
  const { aquariumId } = params;

  // Fetch aquarium to verify it exists
  const aquariumResult = await getAquariumById(aquariumId);

  if (aquariumResult.error || !aquariumResult.aquarium) {
    notFound();
  }

  const { aquarium } = aquariumResult;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href={`/aquariums/${aquariumId}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to {aquarium.name}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Beaker className="h-8 w-8 text-primary" />
              Manual Water Test Entry
            </CardTitle>
            <CardDescription className="text-base">
              Enter water parameters manually from your test kit or digital meter for {aquarium.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Tips for Accurate Entry:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Enter values immediately after testing for best accuracy</li>
                <li>Use the suggested parameters or add custom ones</li>
                <li>Set ideal ranges to get automatic status calculations</li>
                <li>Add notes about water changes, feeding, or other relevant factors</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <ManualTestForm aquariumId={aquariumId} />
    </div>
  );
}
