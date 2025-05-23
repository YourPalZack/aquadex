
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { LocalFishStore, MarketplaceListing } from '@/types';
// For now, we'll re-use the mock data from the main LFS page for simplicity.
// In a real app, you'd fetch specific store data.
import { mockLocalFishStoresData } from '@/app/local-fish-stores/page'; 
// For mock marketplace listings:
import { mockMarketplaceListingsData } from '@/app/marketplace/page';
import MarketplaceListingCard from '@/components/marketplace/MarketplaceListingCard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, MapPin, Phone, Globe, Clock, Info, ShieldCheck, ShoppingBag, Building
} from 'lucide-react';

const mockStoreHasSellerProfile = true; // Simulate if this store also has a seller profile for listings

export default function LocalFishStoreProfilePage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.storeSlug as string;

  const [store, setStore] = useState<LocalFishStore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedListings, setRelatedListings] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    if (storeSlug) {
      setIsLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        const foundStore = mockLocalFishStoresData.find(s => s.slug === storeSlug);
        if (foundStore) {
          setStore(foundStore);
          // Simulate finding marketplace listings by this store (e.g., if store.id was linked to sellerId)
          // This is a simplification for demo.
          if (mockStoreHasSellerProfile) { 
            const listings = mockMarketplaceListingsData.filter(
              listing => listing.sellerName.toLowerCase().includes(foundStore.name.split(' ')[0].toLowerCase()) // very basic match
            ).slice(0,3); // Show a few
            setRelatedListings(listings);
          }
        } else {
          setStore(null);
        }
        setIsLoading(false);
      }, 300);
    }
  }, [storeSlug]);

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center text-lg font-semibold">Loading store details...</div>;
  }

  if (!store) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader><CardTitle>Store Not Found</CardTitle></CardHeader>
          <CardContent>
            <Info className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p>The fish store you are looking for does not exist or could not be loaded.</p>
            <Button variant="outline" asChild className="mt-6">
              <Link href="/local-fish-stores"><ArrowLeft className="mr-2 h-4 w-4" />Back to Store Finder</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderHours = (hours?: LocalFishStore['operatingHours']) => {
    if (!hours || Object.keys(hours).length === 0) return <p className="text-foreground/80">Not available</p>;
    const daysOrder: (keyof LocalFishStore['operatingHours'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return (
      <ul className="space-y-1 text-sm">
        {daysOrder.map(day => {
          const dayHours = hours[day];
          if (dayHours) {
            return (
              <li key={day} className="flex justify-between">
                <span className="capitalize text-foreground/90">{day}:</span>
                <span className="text-foreground/80">{dayHours}</span>
              </li>
            );
          }
          return null;
        })}
      </ul>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <Button variant="outline" onClick={() => router.push('/local-fish-stores')} className="mb-6 shadow-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store Finder
        </Button>
      </div>

      <Card className="overflow-hidden shadow-xl">
         {store.imageUrl && (
          <div className="relative w-full h-64 md:h-80 bg-muted border-b">
            <Image 
                src={store.imageUrl} 
                alt={`Image of ${store.name}`} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={store.imageHint || "fish store building"}
                priority 
            />
            {store.isVerified && (
                <Badge variant="default" className="absolute top-4 right-4 bg-green-600 hover:bg-green-700 text-lg py-1.5 px-3 shadow-md">
                    <ShieldCheck className="w-5 h-5 mr-2" /> Verified Business
                </Badge>
            )}
          </div>
        )}
        <CardHeader className="border-b bg-card">
          <CardTitle className="text-3xl lg:text-4xl flex items-center text-primary">
            <Building className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
            {store.name}
          </CardTitle>
          <CardDescription className="text-base mt-2 ml-1">
            {store.address}, {store.city}, {store.state} {store.zipCode}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 grid md:grid-cols-3 gap-x-10 gap-y-8">
            <div className="md:col-span-2 space-y-6">
                {store.description && (
                     <div>
                        <h3 className="font-semibold text-xl text-foreground/90 mb-2 flex items-center"><Info className="w-5 h-5 mr-2 text-primary" />About This Store</h3>
                        <p className="text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-md border">
                            {store.description}
                        </p>
                    </div>
                )}
                {store.services && store.services.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-xl text-foreground/90 mb-2">Services Offered</h3>
                        <div className="flex flex-wrap gap-2">
                            {store.services.map(service => (
                                <Badge key={service} variant="secondary" className="px-3 py-1 text-sm">{service}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-background shadow-sm md:col-span-1">
                 <h3 className="font-semibold text-xl text-foreground/90 mb-3 border-b pb-2">Store Information</h3>
                {store.phone && (
                    <p className="flex items-center text-foreground/90"><Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {store.phone}</p>
                )}
                {store.website && (
                     <a 
                        href={store.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline flex items-center group"
                    >
                        <Globe className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary" /> Visit Website
                    </a>
                )}
                <Separator className="my-3" />
                <div>
                    <h4 className="font-semibold text-md text-foreground/90 mb-2 flex items-center"><Clock className="w-4 h-4 mr-2 text-muted-foreground" />Operating Hours</h4>
                    {renderHours(store.operatingHours)}
                </div>
            </div>
        </CardContent>
      </Card>
      
      {/* Placeholder for Marketplace Listings by this Store */}
      {relatedListings.length > 0 && (
        <Card className="shadow-lg border-accent/30">
            <CardHeader>
            <CardTitle className="text-2xl flex items-center">
                <ShoppingBag className="w-7 h-7 mr-3 text-accent" />
                Marketplace Listings from {store.name}
            </CardTitle>
            <CardDescription>
                Items listed by this store on the AquaDex Marketplace. (Simulated)
            </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6">
                {relatedListings.map(listing => (
                    <MarketplaceListingCard key={listing.id} listing={listing} />
                ))}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
