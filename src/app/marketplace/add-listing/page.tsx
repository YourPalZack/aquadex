
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarketplaceListingForm from '@/components/marketplace/MarketplaceListingForm';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { MarketplaceListingFormValues } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ListPlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';


export default function AddMarketplaceListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: MarketplaceListingFormValues) => {
    setIsLoading(true);
    console.log('Marketplace Listing Data to submit:', data);

    // Simulate API call for creating a listing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you'd get the new listing ID and slug from the backend
    // For now, we'll just simulate success
    const newListingSlug = data.title.toLowerCase().replace(/\s+/g, '-').slice(0,50) + '-mock-seller';

    toast({
      title: 'Listing Created Successfully!',
      description: `Your item "${data.title}" has been listed. (Mocked)`,
    });

    setIsLoading(false);
    // Redirect to the new listing (or marketplace page)
    router.push(`/marketplace/${data.categorySlug}/${newListingSlug}`);
  };

  return (
    <div className="container mx-auto py-8">
        <h1 className="sr-only">Create Marketplace Listing</h1>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Marketplace', href: '/marketplace' },
            { label: 'Add Listing' },
          ]}
          className="mb-4"
        />
        <div className="mb-6">
             <Button variant="outline" asChild>
                <Link href="/marketplace">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
                </Link>
            </Button>
        </div>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-3xl flex items-center text-primary">
            <ListPlus className="w-8 h-8 mr-3" />
            Create New Marketplace Listing
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 pt-2">
            Fill out the details below to list your aquarium-related item for sale.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-6 text-sm text-muted-foreground">
            Ensure your item details are accurate and provide clear images (via URL for now). 
            All listings are subject to community guidelines.
          </p>
          <MarketplaceListingForm 
            onSubmit={handleFormSubmit} 
            onCancel={() => router.push('/marketplace')}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
