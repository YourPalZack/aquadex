
'use client';

import { useState } from 'react';
import type { Aquarium } from '@/types';
import AquariumCard from '@/components/aquariums/AquariumCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Droplets } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Mock Data
const mockAquariumsData: Aquarium[] = [
  {
    id: 'aqua1',
    userId: 'user123',
    name: 'Living Room Reef',
    volumeGallons: 75,
    type: 'saltwater',
    lastWaterChange: new Date('2024-07-15'),
    nextWaterChangeReminder: new Date('2024-07-29'),
    notes: 'Keeping an eye on SPS coral growth. Clownfish are active.',
  },
  {
    id: 'aqua2',
    userId: 'user123',
    name: 'Betta Paradise',
    volumeGallons: 5,
    type: 'freshwater',
    lastWaterChange: new Date('2024-07-20'),
    nextWaterChangeReminder: new Date('2024-07-27'),
    notes: 'Betta seems happy. Plants are growing well. Added some shrimp.',
  },
  {
    id: 'aqua3',
    userId: 'user123',
    name: 'Community Tank',
    volumeGallons: 29,
    type: 'freshwater',
    notes: 'New guppies added last week. Everyone seems to be getting along.',
  },
  {
    id: 'aqua4',
    userId: 'user123',
    name: 'Office Nano Reef',
    volumeGallons: 10,
    type: 'reef',
    lastWaterChange: new Date('2024-07-18'),
    notes: 'Small zoa garden and a single ricordea. Skimmer running fine.'
  },
];

export default function AquariumsPage() {
  const [aquariums, setAquariums] = useState<Aquarium[]>(mockAquariumsData);
  const { toast } = useToast();

  // Placeholder functions for edit/delete
  const handleEditAquarium = (aquariumId: string) => {
    toast({
      title: "Edit Aquarium",
      description: `Editing aquarium with ID: ${aquariumId} (Not implemented yet).`,
    });
    console.log('Edit aquarium:', aquariumId);
    // Here you would typically open a modal or navigate to an edit page
  };

  const handleDeleteAquarium = (aquariumId: string) => {
     // For now, just filter out the aquarium from the state
    setAquariums(prevAquariums => prevAquariums.filter(aq => aq.id !== aquariumId));
    toast({
      title: "Aquarium Deleted (Mock)",
      description: `Aquarium with ID: ${aquariumId} has been removed from view.`,
      variant: 'destructive'
    });
    console.log('Delete aquarium:', aquariumId);
    // In a real app, you would also call an API to delete it from the backend
  };

  const handleAddAquarium = () => {
    toast({
      title: "Add New Aquarium",
      description: "This feature is not implemented yet.",
    });
    console.log('Add new aquarium');
    // Here you would open a form/modal to add a new aquarium
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 bg-primary/10 border-primary/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl flex items-center text-primary">
              <Droplets className="w-8 h-8 mr-3" />
              My Aquariums
            </CardTitle>
            <Button onClick={handleAddAquarium} size="lg">
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New Aquarium
            </Button>
          </div>
          <CardDescription className="text-base text-foreground/80 pt-2">
            Manage all your aquariums in one place. Track maintenance, parameters, and notes.
          </CardDescription>
        </CardHeader>
      </Card>

      {aquariums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aquariums.map((aquarium) => (
            <AquariumCard
              key={aquarium.id}
              aquarium={aquarium}
              onEdit={handleEditAquarium}
              onDelete={handleDeleteAquarium}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-10">
              <Droplets className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">No Aquariums Yet</p>
              <p className="mb-4">Click "Add New Aquarium" to get started.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
