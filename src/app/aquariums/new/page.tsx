import { AquariumForm } from '@/components/aquariums/aquarium-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewAquariumPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/aquariums">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Aquariums
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Aquarium</h1>
        <p className="text-muted-foreground">
          Add a new aquarium to your collection
        </p>
      </div>

      {/* Form */}
      <AquariumForm mode="create" />
    </div>
  );
}
