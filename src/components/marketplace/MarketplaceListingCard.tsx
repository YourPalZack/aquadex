
'use client';

import type { MarketplaceListing } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, DollarSign, Tag, UserCircle, CalendarDays, PackageCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
}

export default function MarketplaceListingCard({ listing }: MarketplaceListingCardProps) {
  const conditionDisplay: Record<MarketplaceListing['condition'], string> = {
    'new': 'New',
    'used-like-new': 'Used - Like New',
    'used-good': 'Used - Good',
    'used-fair': 'Used - Fair',
    'for-parts': 'For Parts/Not Working',
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card">
      <Link href={`/marketplace/${listing.categorySlug}/${listing.slug}`} passHref>
        <div className="aspect-video relative w-full rounded-t-lg overflow-hidden bg-muted border-b cursor-pointer">
          <Image 
            src={listing.imageUrl} 
            alt={listing.title} 
            layout="fill" 
            objectFit="cover"
            data-ai-hint={listing.imageHint || 'aquarium product marketplace'}
          />
        </div>
      </Link>
      <CardHeader className="pb-2 pt-4">
        <Link href={`/marketplace/${listing.categorySlug}/${listing.slug}`} passHref>
          <CardTitle className="text-lg leading-tight hover:text-primary transition-colors cursor-pointer">
              {listing.title}
          </CardTitle>
        </Link>
        <CardDescription className="flex items-center text-xs pt-1 text-muted-foreground">
          <UserCircle className="w-3 h-3 mr-1.5" />
          Seller: {listing.sellerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 py-3">
        <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-primary flex items-center">
                {listing.price.toLowerCase().includes("contact") ? <Tag className="w-5 h-5 mr-1" /> : <DollarSign className="w-5 h-5 mr-0.5" />}
                {listing.price}
            </p>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
            <PackageCheck className="w-4 h-4 mr-1.5" /> Condition: {conditionDisplay[listing.condition]}
        </div>
        {listing.location && (
             <p className="text-xs text-muted-foreground">Location: {listing.location}</p>
        )}
        <p className="text-xs text-muted-foreground">
            Posted: {format(new Date(listing.createdAt), 'MMM d, yyyy')}
        </p>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <Button asChild variant="outline" className="w-full hover:border-primary/70">
          <Link href={`/marketplace/${listing.categorySlug}/${listing.slug}`}>
            View Details <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
