
'use client';

import { useState, useEffect } from 'react';
import type { Aquarium, AquariumFormValues as AquariumFormData } from '@/types';
import AquariumCard from '@/components/aquariums/AquariumCard';
import AquariumForm from '@/components/aquariums/AquariumForm';
import { Button } from '@/components/ui/button';
import { PlusCircle, Droplets, Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { addAquarium as addAquariumAction } from '@/lib/actions'; // Assuming a similar action exists or will be created

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
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAquarium, setEditingAquarium] = useState<Aquarium | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simulate loading data
  useEffect(() => {
    setAquariums(mockAquariumsData);
  }, []);

  const handleAddAquarium = () => {
    setEditingAquarium(null);
    setIsDialogOpen(true);
  };

  const handleEditAquarium = (aquariumId: string) => {
    const aquariumToEdit = aquariums.find(aq => aq.id === aquariumId);
    if (aquariumToEdit) {
      setEditingAquarium(aquariumToEdit);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteAquarium = (aquariumId: string) => {
    setAquariums(prevAquariums => prevAquariums.filter(aq => aq.id !== aquariumId));
    toast({
      title: "Aquarium Deleted",
      description: `Aquarium has been removed from view.`,
      variant: 'destructive'
    });
    // In a real app, call an API to delete from backend:
    // e.g., deleteAquariumAction(aquariumId);
  };

  const handleFormSubmit = async (data: AquariumFormData) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (editingAquarium) {
        // Update existing aquarium
        const updatedAquarium: Aquarium = { 
            ...editingAquarium, 
            ...data,
            volumeGallons: data.volumeGallons ? Number(data.volumeGallons) : undefined,
         };
        setAquariums(prev => prev.map(aq => aq.id === editingAquarium.id ? updatedAquarium : aq));
        toast({ title: "Aquarium Updated", description: `${updatedAquarium.name} has been updated.` });
        // In a real app: await updateAquariumAction(updatedAquarium);
      } else {
        // Add new aquarium
        const newAquarium: Aquarium = {
          id: `aqua${Date.now()}`, // Simple mock ID
          userId: 'user123', // Mock user ID
          ...data,
          volumeGallons: data.volumeGallons ? Number(data.volumeGallons) : undefined,
        };
        // Simulate calling a server action
        // const result = await addAquariumAction(newAquarium);
        // if (result.success) {
        //   setAquariums(prev => [newAquarium, ...prev]);
        //   toast({ title: "Aquarium Added", description: `${newAquarium.name} has been added.` });
        // } else {
        //   toast({ title: "Error", description: result.message || "Could not add aquarium.", variant: "destructive" });
        // }
        setAquariums(prev => [newAquarium, ...prev]); // Optimistic update for now
        toast({ title: "Aquarium Added", description: `${newAquarium.name} has been added.` });
      }
      setIsDialogOpen(false);
      setEditingAquarium(null);
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while saving the aquarium.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setEditingAquarium(null); // Reset editing state when dialog closes
          }
          setIsDialogOpen(open);
        }}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAquarium ? 'Edit Aquarium' : 'Add New Aquarium'}</DialogTitle>
            <DialogDescription>
              {editingAquarium ? 'Update the details of your aquarium.' : 'Fill in the details to add a new aquarium.'}
            </DialogDescription>
          </DialogHeader>
          <AquariumForm
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingAquarium(null);
            }}
            defaultValues={editingAquarium || undefined}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
