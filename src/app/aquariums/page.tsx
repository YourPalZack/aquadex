
'use client';

import { useState, useEffect } from 'react';
import type { Aquarium, AquariumFormValues as AquariumFormData } from '@/types';
import { mockAquariumsData } from '@/types'; // Updated import path
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
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation'; 
// Removed date-fns imports as they are now handled in types.ts with mockAquariumsData


export default function AquariumsPage() {
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAquarium, setEditingAquarium] = useState<Aquarium | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const { toast } = useToast();
  const searchParams = useSearchParams(); 

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
        setAquariums(mockAquariumsData);
        setIsLoading(false);

        const editAquariumId = searchParams.get('edit');
        if (editAquariumId && !isLoading) { 
            const aquariumToEdit = mockAquariumsData.find(aq => aq.id === editAquariumId);
            if (aquariumToEdit) {
                setEditingAquarium(aquariumToEdit);
                setIsDialogOpen(true);
            }
        }
    }, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); 

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
      description: `Aquarium has been removed.`,
      variant: 'destructive'
    });
  };

  const handleFormSubmit = async (data: AquariumFormData) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (editingAquarium) {
        const updatedAquarium: Aquarium = { 
            ...editingAquarium, 
            ...data,
            volumeGallons: data.volumeGallons ? Number(data.volumeGallons) : undefined,
            fishCount: data.fishCount ? Number(data.fishCount) : undefined,
            co2Injection: data.co2Injection || false,
            imageUrl: data.imageUrl || undefined,
            foodDetails: data.foodDetails || undefined,
            nextFeedingReminder: data.nextFeedingReminder,
            sourceWaterType: data.sourceWaterType || undefined,
            sourceWaterParameters: data.sourceWaterParameters || undefined,
         };
        setAquariums(prev => prev.map(aq => aq.id === editingAquarium.id ? updatedAquarium : aq));
        toast({ title: "Aquarium Updated", description: `${updatedAquarium.name} has been updated.` });
      } else {
        const newAquariumData: Aquarium = {
          id: `aqua${Date.now()}`, 
          userId: 'user123', 
          ...data,
          volumeGallons: data.volumeGallons ? Number(data.volumeGallons) : undefined,
          fishCount: data.fishCount ? Number(data.fishCount) : undefined,
          co2Injection: data.co2Injection || false,
          imageUrl: data.imageUrl || undefined,
          foodDetails: data.foodDetails || undefined,
          nextFeedingReminder: data.nextFeedingReminder,
          sourceWaterType: data.sourceWaterType || undefined,
          sourceWaterParameters: data.sourceWaterParameters || undefined,
        };
        setAquariums(prev => [newAquariumData, ...prev]); 
        toast({ title: "Aquarium Added", description: `${newAquariumData.name} has been added.` });
      }
      setIsDialogOpen(false);
      setEditingAquarium(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ title: "Error", description: "An error occurred while saving the aquarium. Check console for details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
                <CardTitle className="text-3xl flex items-center text-primary">
                <Droplets className="w-8 h-8 mr-3" />
                My Aquariums
                </CardTitle>
                <CardDescription className="text-base text-foreground/80 pt-2">
                    Manage all your aquariums in one place. Track maintenance, parameters, and notes.
                </CardDescription>
            </div>
            <Button onClick={handleAddAquarium} size="lg" className="w-full sm:w-auto flex-shrink-0">
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New Aquarium
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading && aquariums.length === 0 && (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
         </div>
      )}

      {!isLoading && aquariums.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-10">
              <Droplets className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">No Aquariums Yet</p>
              <p className="mb-4">Click "Add New Aquarium" to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && aquariums.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {aquariums.map((aquarium) => (
            <AquariumCard
              key={aquarium.id}
              aquarium={aquarium}
              onEdit={handleEditAquarium}
              onDelete={handleDeleteAquarium}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setEditingAquarium(null); 
            // Clear the 'edit' query param from URL without navigation to avoid re-triggering
             if (searchParams.get('edit')) {
                 const newPath = window.location.pathname;
                 window.history.replaceState({...window.history.state, as: newPath, url: newPath }, '', newPath);
             }
          }
          setIsDialogOpen(open);
        }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl">{editingAquarium ? 'Edit Aquarium' : 'Add New Aquarium'}</DialogTitle>
            <DialogDescription>
              {editingAquarium ? 'Update the details of your aquarium.' : 'Fill in the details to add a new aquarium.'}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto"> 
            <AquariumForm
                onSubmit={handleFormSubmit}
                onCancel={() => {
                setIsDialogOpen(false);
                setEditingAquarium(null);
                 // Clear the 'edit' query param from URL
                if (searchParams.get('edit')) {
                     const newPath = window.location.pathname;
                     window.history.replaceState({...window.history.state, as: newPath, url: newPath }, '', newPath);
                 }
                }}
                defaultValues={editingAquarium || undefined}
                isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    