import { notFound } from 'next/navigation';
import { getAquariumById, getLivestock, getEquipment } from '@/lib/actions/aquarium';
import { getAquariumWaterTests } from '@/lib/actions/water-test';
import { AquariumDetails } from '@/components/aquariums/aquarium-details';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface AquariumDetailPageProps {
  params: {
    aquariumId: string;
  };
}

export default async function AquariumDetailPage({ params }: AquariumDetailPageProps) {
  const { aquariumId } = params;

  // Fetch aquarium and related data
  const [aquariumResult, livestockResult, equipmentResult, waterTestsResult] = await Promise.all([
    getAquariumById(aquariumId),
    getLivestock({ aquariumId }),
    getEquipment({ aquariumId }),
    getAquariumWaterTests(aquariumId),
  ]);

  // Handle not found
  if (aquariumResult.error || !aquariumResult.aquarium) {
    notFound();
  }

  const { aquarium } = aquariumResult;
  const livestock = Array.isArray(livestockResult.livestock) 
    ? livestockResult.livestock 
    : [];
  const equipment = Array.isArray(equipmentResult.equipment)
    ? equipmentResult.equipment
    : [];
  const waterTests = Array.isArray(waterTestsResult.waterTests)
    ? waterTestsResult.waterTests
    : [];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/aquariums">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Aquariums
          </Link>
        </Button>
      </div>

      {/* Aquarium Details Component */}
      <AquariumDetails 
        aquarium={aquarium} 
        livestock={livestock}
        equipment={equipment}
        waterTests={waterTests}
      />
    </div>
  );
}
