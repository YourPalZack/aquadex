import { notFound } from 'next/navigation';
import { getAquariumById, getLivestock } from '@/lib/actions/aquarium';
import { LivestockForm } from '@/components/aquariums/livestock-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface EditLivestockPageProps {
  params: {
    aquariumId: string;
    livestockId: string;
  };
}

export default async function EditLivestockPage({ params }: EditLivestockPageProps) {
  const { aquariumId, livestockId } = params;

  // Fetch data
  const [aquariumResult, livestockResult] = await Promise.all([
    getAquariumById(aquariumId),
    getLivestock({ aquariumId }),
  ]);

  if (aquariumResult.error || !aquariumResult.aquarium) {
    notFound();
  }

  const livestock = livestockResult.livestock?.find((l: any) => l.id === livestockId);

  if (!livestock) {
    notFound();
  }

  const { aquarium } = aquariumResult;

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href={`/aquariums/${aquariumId}/livestock/${livestockId}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to {livestock.species}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Livestock</h1>
        <p className="text-muted-foreground">
          Update livestock information for {aquarium.name}
        </p>
      </div>

      {/* Form */}
      <LivestockForm 
        aquariumId={aquariumId} 
        mode="edit" 
        initialData={livestock}
      />
    </div>
  );
}
