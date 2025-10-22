
'use client';

import { useState, useEffect, useActionState } from 'react';
import type { WaterTreatmentProduct, WaterTreatmentProductFormValues } from '@/types';
import TreatmentProductCard from '@/components/treatments/TreatmentProductCard';
import TreatmentProductForm from '@/components/treatments/TreatmentProductForm';
import { Button } from '@/components/ui/button';
import { PlusCircle, FlaskConical, Loader2, Info } from 'lucide-react';
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
import { addWaterTreatmentProductAction, type AddWaterTreatmentProductActionState } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';


const initialFormState: AddWaterTreatmentProductActionState = {
  message: null,
  errors: null,
  newProductItem: null,
};

// Example initial data - in a real app, this would come from a DB
const mockTreatmentProductsData: WaterTreatmentProduct[] = [
  {
    id: 'treat1',
    userId: 'user123',
    name: 'Seachem Prime',
    brand: 'Seachem',
    type: 'Dechlorinator',
    notes: 'Essential for water changes. Detoxifies ammonia, nitrite, nitrate.',
    amazonLinks: [
      { storeName: 'Amazon US', url: 'https://www.amazon.com/s?k=Seachem+Prime&tag=YOUR_AMAZON_TAG-20' },
    ]
  },
  {
    id: 'treat2',
    userId: 'user123',
    name: 'API Stress Coat+',
    brand: 'API',
    type: 'Water Conditioner',
    notes: 'Helps heal damaged tissue and reduces fish stress.',
  },
];


export default function ManageTreatmentsPage() {
  const [treatmentProducts, setTreatmentProducts] = useState<WaterTreatmentProduct[]>(mockTreatmentProductsData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  const [formState, formAction] = useActionState(addWaterTreatmentProductAction, initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (formState.message) {
      if (formState.errors) {
        toast({
          title: "Error Adding Product",
          description: formState.message || "Please check the form for errors.",
          variant: "destructive",
        });
      } else if (formState.newProductItem) {
        toast({
          title: "Product Added",
          description: formState.message || `${formState.newProductItem.name} added successfully.`,
        });
        setTreatmentProducts(prev => [formState.newProductItem!, ...prev]);
        setIsFormOpen(false); // Close dialog on success
      }
    }
    setIsSubmitting(false); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]); 

  const handleFormSubmit = async (data: WaterTreatmentProductFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.brand) formData.append('brand', data.brand);
    if (data.type) formData.append('type', data.type);
    if (data.notes) formData.append('notes', data.notes);
    
    await formAction(formData);
  };

  const handleDeleteProduct = (productId: string) => {
    setTreatmentProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
    toast({
      title: "Product Removed",
      description: `The treatment product has been removed from this list.`,
      variant: 'destructive'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">Manage Water Treatments</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Treatments' },
        ]}
        className="mb-4"
      />
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <FlaskConical className="w-8 h-8 mr-3" />
                Manage Water Treatments
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Keep track of your water treatment products and get quick purchase links. Links use a placeholder referral tag.
              </CardDescription>
            </div>
            <Button size="lg" onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New Product
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isSubmitting && treatmentProducts.length === 0 && ( 
         <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
         </div>
      )}

      {!isSubmitting && treatmentProducts.length === 0 && (
        <EmptyState
          title="No Treatment Products"
          description="Click Add New Product to get started and generate purchase links."
          icon={<FlaskConical className="w-10 h-10" />}
          action={(
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" /> Add New Product
            </Button>
          )}
        />
      )}

      {treatmentProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {treatmentProducts.map((product) => (
            <TreatmentProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteProduct}
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
            <DialogTitle className="text-2xl">Add New Treatment Product</DialogTitle>
            <DialogDescription>
              Enter the details of the water treatment product. The system will attempt to generate Amazon purchase links.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <TreatmentProductForm
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
