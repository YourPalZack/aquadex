
'use client';

import type { LightingListing } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, DollarSign, Store, Zap, Sun, Tag, Maximize, Award } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LightingListingCardProps {
  listing: LightingListing;
}

export default function LightingListingCard({ listing }: LightingListingCardProps) {
  return (
    <Card className={cn(
        "w-full shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col",
        listing.isRecommended && "border-2 border-primary bg-primary/5"
    )}>
      {listing.imageUrl && (
        <div className="aspect-[4/3] relative w-full rounded-t-lg overflow-hidden bg-muted">
          <Image 
            src={listing.imageUrl} 
            alt={listing.listingTitle} 
            layout="fill" 
            objectFit="cover"
            data-ai-hint={listing.dataAiHint || 'aquarium light'}
          />
        </div>
      )}
      <CardHeader className="pb-3">
        {listing.isRecommended && (
            <Badge variant="default" className="absolute top-2 right-2 bg-primary/80 text-primary-foreground flex items-center gap-1 text-xs py-1 px-2">
                <Award className="w-3 h-3" /> Recommended
            </Badge>
        )}
        <CardTitle className="text-lg flex items-center">
            <Sun className="w-5 h-5 mr-2 text-primary" />
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
         {listing.lightType && (
          <div className="flex items-center text-sm">
            <Zap className="w-4 h-4 mr-1.5 text-muted-foreground" /> {/* Using Zap for light type */}
            <span className="font-medium mr-1">Type:</span>{listing.lightType}
          </div>
        )}
        {listing.wattageOrPAR && (
          <div className="flex items-center text-sm">
            <Zap className="w-4 h-4 mr-1.5 text-muted-foreground" /> {/* Re-using Zap or another suitable icon */}
            <span className="font-medium mr-1">Power:</span>{listing.wattageOrPAR}
          </div>
        )}
        {listing.coverageArea && (
          <div className="flex items-center text-sm">
            <Maximize className="w-4 h-4 mr-1.5 text-muted-foreground" />
            <span className="font-medium mr-1">Coverage:</span>{listing.coverageArea}
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
