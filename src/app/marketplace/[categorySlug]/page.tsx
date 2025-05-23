
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { MarketplaceListing, MarketplaceCategory } from '@/types';
import { marketplaceCategoriesData } from '@/types'; // Corrected import path
import { mockMarketplaceListingsData } from '@/app/marketplace/page'; 
import MarketplaceListingCard from '@/components/marketplace/MarketplaceListingCard';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Package, Info } from 'lucide-react';
import Link from 'next/link';

export default function MarketplaceCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.categorySlug as string;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState<MarketplaceCategory | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    const foundCategory = marketplaceCategoriesData.find(cat => cat.slug === categorySlug);
    if (foundCategory) {
      setCurrentCategory(foundCategory);
      const categoryListings = mockMarketplaceListingsData.filter(
        listing => listing.categorySlug === categorySlug
      );
      setListings(categoryListings);
    } else {
      // Handle category not found, e.g., redirect or show a 404-like message
      // For now, we'll just show a message if the category isn't in our mock data.
      setCurrentCategory(null);
      setListings([]);
    }
  }, [categorySlug]);

  const filteredListings = useMemo(() => {
    if (!searchTerm) return listings;
    return listings.filter(listing =>
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (listing.tags && listing.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [listings, searchTerm]);

  if (!currentCategory && listings.length === 0) {
     // This check runs before useEffect completes if categorySlug is invalid
     // We can also explicitly check if currentCategory is null after useEffect
    return (
        <div className="container mx-auto py-8 text-center">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                        <Package className="w-8 h-8 mr-3 text-destructive" /> Category Not Found
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The marketplace category <span className="font-semibold">{categorySlug}</span> does not exist or has no listings.</p>
                    <Button variant="outline" asChild className="mt-6">
                        <Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  const IconComponent = currentCategory?.icon;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/marketplace')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>

      <Card className="mb-8 bg-primary/10 border-primary/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center text-primary">
                {IconComponent && <IconComponent className="w-8 h-8 mr-3" />}
                {currentCategory?.name || 'Category Listings'}
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                {currentCategory?.description || `Browse items in this category.`}
              </CardDescription>
            </div>
             <Button asChild variant="outline" size="lg">
                 <Link href="/marketplace/apply-to-sell">
                    List Your Item
                 </Link>
             </Button>
          </div>
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={`Search in ${currentCategory?.name || 'this category'}...`}
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <MarketplaceListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-10">
             <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-xl font-semibold mb-2">No Listings Found</p>
            <p>
              {searchTerm 
                ? `No items match your search "${searchTerm}" in the ${currentCategory?.name || 'current'} category.`
                : `There are currently no items listed in the ${currentCategory?.name || 'current'} category.`
              }
            </p>
            <p className="mt-2">Check back later or try a different category!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
