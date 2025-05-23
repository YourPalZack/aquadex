
'use client';

import type { FishListing } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, DollarSign, Info, Store } from 'lucide-react';
import Image from 'next/image';

interface FishListingCardProps {
  listing: FishListing;
}

export default function FishListingCard({ listing }: FishListingCardProps) {
  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {listing.imageUrl && (
        <div className="aspect-video relative w-full rounded-t-lg overflow-hidden bg-muted">
          <Image 
            src={listing.imageUrl} 
            alt={listing.listingTitle} 
            layout="fill" 
            objectFit="cover"
            data-ai-hint={listing.dataAiHint || 'fish aquarium'}
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{listing.listingTitle}</CardTitle>
        <CardDescription className="flex items-center text-sm pt-1">
          <Store className="w-4 h-4 mr-1.5 text-muted-foreground" />
          Source: {listing.sourceName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {listing.price && (
          <p className="text-md font-semibold text-primary flex items-center mb-3">
            <DollarSign className="w-4 h-4 mr-1" />
            {listing.price}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
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
