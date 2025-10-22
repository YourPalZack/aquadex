
'use client';

import type { MarketplaceListing } from '@/types'; // MarketplaceCategory removed from here
import { marketplaceCategoriesData } from '@/types'; // Imported from types
import MarketplaceCategoryCard from '@/components/marketplace/MarketplaceCategoryCard';
import MarketplaceListingCard from '@/components/marketplace/MarketplaceListingCard';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, PlusCircle, Tag, Edit, Search, Fish, Leaf, Package as PackageIcon, HardHat } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';

// Mock Data for listings - categories data is now imported
export const mockMarketplaceListingsData: MarketplaceListing[] = [
  {
    id: 'mf1',
    slug: 'pair-of-clownfish-breeder-bob',
    title: 'Bonded Pair of Ocellaris Clownfish',
    description: 'Healthy, tank-raised ocellaris clownfish pair. Eating pellets and frozen food. Approximately 1.5 inches each. Perfect for reef tanks.',
    price: '$45.00',
    categorySlug: 'live-fish',
    sellerId: 'sellerBob123',
    sellerName: 'Breeder Bob',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'clownfish pair',
    condition: 'new', // 'new' for live animals typically refers to them being healthy and ready for a new home
    location: 'Springfield, IL',
    createdAt: new Date('2024-07-20T10:00:00Z'),
    isFeatured: true,
  },
  {
    id: 'mp1',
    slug: 'anubias-nana-petite-alice-aqua',
    title: 'Anubias Nana Petite on Driftwood',
    description: 'Beautiful Anubias Nana Petite attached to a small piece of driftwood. Easy low-light plant, great for beginners or nano tanks.',
    price: '$15.00',
    categorySlug: 'live-plants',
    sellerId: 'sellerAlice123',
    sellerName: 'Alice\'s Aquatics',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'anubias plant driftwood',
    condition: 'new',
    location: 'Oakland, CA',
    createdAt: new Date('2024-07-19T14:30:00Z'),
    isFeatured: true,
  },
  {
    id: 'meq1',
    slug: 'fluval-307-canister-filter-used-charlie-coral',
    title: 'Used Fluval 307 Canister Filter',
    description: 'Fluval 307 canister filter, used for 1 year. In good working condition, includes all media trays and some original hoses. Cleaned and ready for a new tank.',
    price: '$70.00',
    categorySlug: 'used-equipment',
    sellerId: 'sellerCharlie123',
    sellerName: 'Charlie\'s Corals & More',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'canister filter aquarium',
    condition: 'used-good',
    location: 'Miami, FL',
    createdAt: new Date('2024-07-22T09:00:00Z'),
    isFeatured: true,
  },
   {
    id: 'meq2',
    slug: 'eheim-jager-heater-100w-breeder-bob',
    title: 'New Eheim Jager Heater 100W',
    description: 'Brand new, in box Eheim Jager 100W aquarium heater. Never used. Reliable and accurate.',
    price: '$25.00',
    categorySlug: 'new-equipment',
    sellerId: 'sellerBob123',
    sellerName: 'Breeder Bob',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'aquarium heater',
    condition: 'new',
    createdAt: new Date('2024-07-21T11:00:00Z'),
  },
  {
    id: 'free1',
    slug: 'free-java-moss-starter-culture',
    title: 'Free Java Moss Starter Culture',
    description: 'Giving away a golfball-sized portion of healthy Java Moss. Great for shrimp tanks or low-tech setups. Local pickup only.',
    price: 'Free',
    categorySlug: 'free-items',
    sellerId: 'sellerAlice123',
    sellerName: 'Alice\'s Aquatics',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'java moss aquarium',
    condition: 'new', // For plants/livestock, "new" means healthy
    location: 'Oakland, CA',
    createdAt: new Date('2024-07-28T10:00:00Z'),
    isFeatured: false,
    tags: ['java moss', 'free', 'beginner plant', 'local pickup']
  }
];


export default function MarketplacePage() {
    const [featuredListings, setFeaturedListings] = useState<MarketplaceListing[]>([]);

    useEffect(() => {
        // Simulate fetching and filtering featured listings
        setFeaturedListings(mockMarketplaceListingsData.filter(l => l.isFeatured).slice(0, 3));
    }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">AquaDex Marketplace</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Marketplace' },
        ]}
        className="mb-4"
      />
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <ShoppingCart className="w-8 h-8 mr-3" />
                AquaDex Marketplace
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Buy and sell aquarium-related items from fellow hobbyists.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild size="lg">
                    <Link href="/marketplace/apply-to-sell">
                        <Edit className="w-4 h-4 mr-2" /> Apply to Sell
                    </Link>
                </Button>
                {/* Placeholder for "Create Listing" - would be conditionally shown for approved sellers */}
                {/* <Button size="lg" variant="outline" onClick={() => alert("Create Listing feature coming soon for approved sellers!")}>
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create Listing
                </Button> */}
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <Tag className="w-6 h-6 mr-2 text-primary" />
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketplaceCategoriesData.map((category) => (
            <MarketplaceCategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      {featuredListings.length > 0 ? (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Search className="w-6 h-6 mr-2 text-primary" />
            Featured Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <MarketplaceListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="No Featured Listings"
          description="Check back soon, or browse categories below to find items that interest you."
          action={(
            <Button asChild variant="outline" size="sm">
              <Link href="/marketplace/apply-to-sell">Become a Seller</Link>
            </Button>
          )}
        />
      )}

      <Card className="mt-12 bg-accent/20 border-accent/30">
        <CardHeader>
            <CardTitle className="text-lg">Become a Seller on AquaDex</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription className="mb-4">
                Have aquarium gear, fish, or plants to sell? Apply to become a verified seller on AquaDex and reach a dedicated community of aquarium enthusiasts.
            </CardDescription>
            <Button asChild>
                <Link href="/marketplace/apply-to-sell">Learn More & Apply</Link>
            </Button>
        </CardContent>
      </Card>

    </div>
  );
}

    

    