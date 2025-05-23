
'use client';

import { useState, useEffect } from 'react';
import type { FishFood, FishFoodFormValues } from '@/types';
import FoodCard from '@/components/foods/FoodCard';
import FoodForm from '@/components/foods/FoodForm';
import { Button } from '@/components/ui/button';
import { PlusCircle, PackageSearch, Loader2, Info } from 'lucide-react';
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
  // DialogTrigger, // No longer needed here if Dialog is manually controlled by state
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { addFishFoodAction, type AddFishFoodActionState } from '@/lib/actions';
import { useActionState } from 'react'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';


const initialFormState: AddFishFoodActionState = {
  message: null,
  errors: null,
  newFoodItem: null,
};

// Mock Data for initial display
const mockFishFoodsData: FishFood[] = [
  {
    id: 'food1',
    userId: 'user123',
    name: 'Hikari Cichlid Gold Pellets',
    brand: 'Hikari',
    variant: 'Medium Pellet, 8.8 oz',
    notes: 'Main food for adult cichlids. They love it!',
    amazonLinks: [
      { storeName: 'Amazon US', url: 'https://www.amazon.com/s?k=Hikari+Cichlid+Gold+Pellets&tag=YOUR_AMAZON_TAG-20' },
      { storeName: 'Amazon UK', url: 'https://www.amazon.co.uk/s?k=Hikari+Cichlid+Gold+Pellets&tag=YOUR_AMAZON_TAG_UK-21' },
    ]
  },
  {
    id: 'food2',
    userId: 'user123',
    name: 'TetraMin Tropical Flakes',
    brand: 'Tetra',
    variant: '7.06 Ounce',
    notes: 'Good for community tanks.',
    amazonLinks: [
      { storeName: 'Amazon US', url: 'https://www.amazon.com/s?k=TetraMin+Tropical+Flakes&tag=YOUR_AMAZON_TAG-20' },
    ]
  },
];


export default function ManageFoodsPage() {
  const [fishFoods, setFishFoods] = useState<FishFood[]>(mockFishFoodsData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  const [formState, formAction] = useActionState(addFishFoodAction, initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (formState.message) {
      if (formState.errors) {
        toast({
          title: "Error Adding Food",
          description: formState.message || "Please check the form for errors.",
          variant: "destructive",
        });
      } else if (formState.newFoodItem) {
        toast({
          title: "Food Added",
          description: formState.message || `${formState.newFoodItem.name} added successfully.`,
        });
        setFishFoods(prev => [formState.newFoodItem!, ...prev]);
        setIsFormOpen(false); // Close dialog on success
      }
    }
    setIsSubmitting(false); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]); 

  const handleFormSubmit = async (data: FishFoodFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.brand) formData.append('brand', data.brand);
    if (data.variant) formData.append('variant', data.variant);
    if (data.notes) formData.append('notes', data.notes);
    
    await formAction(formData);
  };

  const handleDeleteFood = (foodId: string) => {
    setFishFoods(prevFoods => prevFoods.filter(food => food.id !== foodId));
    toast({
      title: "Food Item Removed",
      description: `The food item has been removed from this list.`,
      variant: 'destructive'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <PackageSearch className="w-8 h-8 mr-3" />
                Manage Fish Foods
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Add your commonly used fish foods to get quick purchase links. Links use a placeholder referral tag.
              </CardDescription>
            </div>
            {/* Removed DialogTrigger wrapper here, Button's onClick handles opening the Dialog */}
            <Button size="lg" onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New Food
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isSubmitting && fishFoods.length === 0 && ( 
         <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
         </div>
      )}

      {!isSubmitting && fishFoods.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-10">
              <PackageSearch className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">No Fish Foods Added Yet</p>
              <p className="mb-4">Click "Add New Food" to get started and generate purchase links.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {fishFoods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {fishFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onDelete={handleDeleteFood}
            />
          ))}
        </div>
      )}
      
      <Alert variant="default" className="mt-8 bg-accent/20 border-accent/50">
        <AlertCircle className="h-4 w-4 text-accent" />
        <AlertTitle className="text-accent/90">Important Note on Amazon Links</AlertTitle>
        <AlertDescription className="text-accent-foreground/80">
          The generated Amazon links use a placeholder referral tag (e.g., <code className="font-mono bg-muted px-1 py-0.5 rounded">YOUR_AMAZON_TAG-20</code>). 
          For these links to work with your Amazon Associates account, you must replace this placeholder with your actual tag. 
          In a production application, this tag should be configured securely, for example, via an environment variable.
        </AlertDescription>
      </Alert>


      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl">Add New Fish Food</DialogTitle>
            <DialogDescription>
              Enter the details of the fish food. The system will attempt to generate Amazon purchase links.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <FoodForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={isSubmitting}
            />
            {formState.message && formState.errors && (
                 <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {formState.message}
                        {formState.errors._form && <p>{formState.errors._form.join(', ')}</p>}
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

