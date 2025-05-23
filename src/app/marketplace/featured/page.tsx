
'use client';

import { useState, useEffect } from 'react';
import type { MarketplaceListing, LocalFishStore, UserProfile } from '@/types';
import { mockMarketplaceListingsData } from '@/app/marketplace/page';
import { mockLocalFishStoresData, mockUsers } from '@/types'; // Updated import

import MarketplaceListingCard from '@/components/marketplace/MarketplaceListingCard';
import LocalFishStoreCard from '@/components/local-fish-stores/LocalFishStoreCard';
import FeaturedSellerCard from '@/components/marketplace/FeaturedSellerCard'; // New component
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, UserCheck, Store as StoreIcon, Info } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function FeaturedMarketplacePage() {
  const [featuredListings, setFeaturedListings] = useState<MarketplaceListing[]>([]);
  const [featuredSellers, setFeaturedSellers] = useState<UserProfile[]>([]);
  const [featuredStores, setFeaturedStores] = useState<LocalFishStore[]>([]);

  useEffect(() => {
    // Simulate fetching and filtering featured data
    setFeaturedListings(mockMarketplaceListingsData.filter(l => l.isFeatured).slice(0, 6)); // Show up to 6
    setFeaturedSellers(mockUsers.filter(u => u.isFeatured).slice(0, 3)); // Show up to 3
    setFeaturedStores(mockLocalFishStoresData.filter(s => s.isFeatured).slice(0, 3)); // Show up to 3
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-12">
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <Star className="w-8 h-8 mr-3" />
                Featured on AquaDex Marketplace
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Discover top listings, trusted sellers, and standout local fish stores from the AquaDex community.
              </CardDescription>
            </div>
             <Button asChild variant="outline">
                <Link href="/marketplace">
                    Browse Full Marketplace
                </Link>
             </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Featured Listings Section */}
      {featuredListings.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <ShoppingCart className="w-7 h-7 mr-3 text-primary" />
            Featured Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map(listing => (
              <MarketplaceListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-10" />

      {/* Featured Sellers Section */}
      {featuredSellers.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <UserCheck className="w-7 h-7 mr-3 text-primary" />
            Featured Sellers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSellers.map(seller => (
              <FeaturedSellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        </section>
      )}
      
      <Separator className="my-10" />

      {/* Featured Local Fish Stores Section */}
      {featuredStores.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <StoreIcon className="w-7 h-7 mr-3 text-primary" />
            Featured Local Fish Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStores.map(store => (
              <LocalFishStoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {(featuredListings.length === 0 && featuredSellers.length === 0 && featuredStores.length === 0) && (
         <Card>
            <CardContent className="pt-6 text-center text-muted-foreground py-10">
                <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-semibold mb-2">No Featured Items Yet</p>
                <p>Check back soon for featured listings, sellers, and stores!</p>
            </CardContent>
        </Card>
      )}

      <Alert variant="default" className="mt-12 bg-accent/20 border-accent/50">
        <Info className="h-4 w-4 text-accent" />
        <AlertTitle className="text-accent/90">Want to Get Featured?</AlertTitle>
        <AlertDescription className="text-accent-foreground/80">
          Featured spots on AquaDex are a great way to increase visibility for your listings, seller profile, or local store.
          Contact us to learn more about promotional opportunities. (This is a conceptual feature for demonstration).
        </AlertDescription>
      </Alert>
    </div>
  );
}

    