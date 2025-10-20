import { notFound } from 'next/navigation';
import { getAquariumById } from '@/lib/actions/aquarium';
import { EquipmentForm } from '@/components/aquariums/equipment-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface NewEquipmentPageProps {
  params: {
    aquariumId: string;
  };
}

export default async function NewEquipmentPage({ params }: NewEquipmentPageProps) {
  const { aquariumId } = params;

  // Verify aquarium exists
  const { aquarium, error } = await getAquariumById(aquariumId);

  if (error || !aquarium) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
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
        <h1 className="text-4xl font-bold mb-2">Add Equipment</h1>
        <p className="text-muted-foreground">
          Add filters, heaters, lights, and other equipment to {aquarium.name}
        </p>
      </div>

      {/* Form */}
      <EquipmentForm aquariumId={aquariumId} mode="create" />
    </div>
  );
}
