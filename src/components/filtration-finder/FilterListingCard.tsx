
'use client';

import type { FilterListing } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, DollarSign, Store, Filter as FilterIcon, Zap, Package, Tag, Waves } from 'lucide-react';
import Image from 'next/image';

interface FilterListingCardProps {
  listing: FilterListing;
}

export default function FilterListingCard({ listing }: FilterListingCardProps) {
  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {listing.imageUrl && (
        <div className="aspect-[4/3] relative w-full rounded-t-lg overflow-hidden bg-muted">
          <Image 
            src={listing.imageUrl} 
            alt={listing.listingTitle} 
            layout="fill" 
            objectFit="cover"
            data-ai-hint={listing.dataAiHint || 'aquarium filter'}
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
            <FilterIcon className="w-5 h-5 mr-2 text-primary" />
            {listing.listingTitle}
        </CardTitle>
        <CardDescription className="flex items-center text-sm pt-1">
          <Store className="w-4 h-4 mr-1.5 text-muted-foreground" />
          Source: {listing.sourceName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        {listing.brand && (
          <div className="flex items-center text-sm">
            <Tag className="w-4 h-4 mr-1.5 text-muted-foreground" />
            <span className="font-medium mr-1">Brand:</span>{listing.brand}
          </div>
        )}
         {listing.filterType && (
          <div className="flex items-center text-sm">
            <Package className="w-4 h-4 mr-1.5 text-muted-foreground" />
            <span className="font-medium mr-1">Type:</span>{listing.filterType}
          </div>
        )}
        {listing.flowRate && (
          <div className="flex items-center text-sm">
            <Zap className="w-4 h-4 mr-1.5 text-muted-foreground" />
            <span className="font-medium mr-1">Flow Rate:</span>{listing.flowRate}
          </div>
        )}
        {listing.suitableTankSize && (
          <div className="flex items-center text-sm">
            <Waves className="w-4 h-4 mr-1.5 text-muted-foreground" />
            <span className="font-medium mr-1">Tank Size:</span>{listing.suitableTankSize}
          </div>
        )}
        {listing.price && (
          <p className="text-md font-semibold text-primary flex items-center pt-2">
            <DollarSign className="w-4 h-4 mr-1" />
            {listing.price}
          </p>
        )}
        <p className="text-xs text-muted-foreground pt-2">
            Note: Listing details are simulated. Always verify on the source website.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href={listing.url} target="_blank" rel="noopener noreferrer">
            View Listing <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
