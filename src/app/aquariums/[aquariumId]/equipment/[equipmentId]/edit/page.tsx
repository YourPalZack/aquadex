import { notFound } from 'next/navigation';
import { getAquariumById, getEquipment } from '@/lib/actions/aquarium';
import { EquipmentForm } from '@/components/aquariums/equipment-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface EditEquipmentPageProps {
  params: {
    aquariumId: string;
    equipmentId: string;
  };
}

export default async function EditEquipmentPage({ params }: EditEquipmentPageProps) {
  const { aquariumId, equipmentId } = params;

  // Fetch data
  const [aquariumResult, equipmentResult] = await Promise.all([
    getAquariumById(aquariumId),
    getEquipment({ aquariumId }),
  ]);

  if (aquariumResult.error || !aquariumResult.aquarium) {
    notFound();
  }

  const equipment = equipmentResult.equipment?.find((e: any) => e.id === equipmentId);

  if (!equipment) {
    notFound();
  }

  const { aquarium } = aquariumResult;

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href={`/aquariums/${aquariumId}/equipment/${equipmentId}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to {equipment.name}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Equipment</h1>
        <p className="text-muted-foreground">
          Update equipment information for {aquarium.name}
        </p>
      </div>

      {/* Form */}
      <EquipmentForm 
        aquariumId={aquariumId} 
        mode="edit" 
        initialData={equipment}
      />
    </div>
  );
}
