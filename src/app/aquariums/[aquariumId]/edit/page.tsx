import { notFound } from 'next/navigation';
import { getAquariumById } from '@/lib/actions/aquarium';
import { AquariumForm } from '@/components/aquariums/aquarium-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface EditAquariumPageProps {
  params: {
    aquariumId: string;
  };
}

export default async function EditAquariumPage({ params }: EditAquariumPageProps) {
  const { aquariumId } = params;

  // Fetch aquarium data
  const { aquarium, error } = await getAquariumById(aquariumId);

  // Handle not found
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
            Back to Aquarium
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Aquarium</h1>
        <p className="text-muted-foreground">
          Update your aquarium information
        </p>
      </div>

      {/* Form */}
      <AquariumForm mode="edit" initialData={aquarium} />
    </div>
  );
}
