
'use client';

import { useEffect, useState }
from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { MarketplaceListing, MarketplaceCategory } from '@/types';
import { marketplaceCategoriesData } from '@/types'; // Corrected import
import { mockMarketplaceListingsData } from '@/app/marketplace/page'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, DollarSign, Tag, CalendarDays, UserCircle, Info, PackageCheck, MapPin, MessageSquare
} from 'lucide-react';

const conditionDisplay: Record<MarketplaceListing['condition'], string> = {
    'new': 'New',
    'used-like-new': 'Used - Like New',
    'used-good': 'Used - Good',
    'used-fair': 'Used - Fair',
    'for-parts': 'For Parts/Not Working',
};

export default function MarketplaceListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.categorySlug as string;
  const listingSlug = params.listingSlug as string;

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [category, setCategory] = useState<MarketplaceCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categorySlug && listingSlug) {
      setIsLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        const foundListing = mockMarketplaceListingsData.find(
          item => item.categorySlug === categorySlug && item.slug === listingSlug
        );
        if (foundListing) {
          setListing(foundListing);
          const foundCategory = marketplaceCategoriesData.find(cat => cat.slug === foundListing.categorySlug);
          setCategory(foundCategory || null);
        } else {
          // Handle not found, e.g., redirect or show error
          setListing(null);
          setCategory(null);
        }
        setIsLoading(false);
      }, 300);
    }
  }, [categorySlug, listingSlug]);

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center text-lg font-semibold">Loading listing details...</div>;
  }

  if (!listing) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader><CardTitle>Listing Not Found</CardTitle></CardHeader>
          <CardContent>
            <Info className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p>The marketplace listing you are looking for does not exist or could not be loaded.</p>
            <Button variant="outline" asChild className="mt-6">
              <Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />Back to Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const IconComponent = category?.icon;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <Button variant="outline" onClick={() => router.back()} className="mb-6 shadow-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
            <div className="relative w-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px] bg-muted">
                <Image 
                    src={listing.imageUrl} 
                    alt={`Image of ${listing.title}`} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={listing.imageHint || "product image"}
                    priority 
                />
            </div>
            <div className="p-6 md:p-8 flex flex-col">
                <CardHeader className="p-0 mb-4">
                    {category && (
                        <Link href={`/marketplace/${category.slug}`} passHref>
                             <Badge variant="secondary" className="mb-2 inline-flex items-center gap-1.5 hover:bg-muted transition-colors w-auto px-3 py-1">
                                { IconComponent && <IconComponent className="w-4 h-4" /> }
                                {category.name}
                            </Badge>
                        </Link>
                    )}
                    <CardTitle className="text-3xl lg:text-4xl text-primary">
                    {listing.title}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p className="flex items-center"><UserCircle className="w-4 h-4 mr-2" /> Sold by: <span className="font-medium text-foreground/90 ml-1">{listing.sellerName}</span></p>
                        <p className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Posted: {format(new Date(listing.createdAt), 'PPP')}</p>
                    </div>
                </CardHeader>
                
                <CardContent className="p-0 flex-grow space-y-4">
                    <div className="text-4xl font-bold text-foreground flex items-center">
                        {listing.price.toLowerCase().includes("contact") ? <Tag className="w-8 h-8 mr-2 text-primary" /> : <DollarSign className="w-8 h-8 mr-1 text-primary" />}
                        {listing.price}
                    </div>

                    <Separator />
                    
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-foreground/90">Item Details:</h3>
                        <p className="flex items-center text-foreground/80"><PackageCheck className="w-5 h-5 mr-2 text-muted-foreground" />Condition: {conditionDisplay[listing.condition]}</p>
                        {listing.location && (
                             <p className="flex items-center text-foreground/80"><MapPin className="w-5 h-5 mr-2 text-muted-foreground" />Location: {listing.location}</p>
                        )}
                    </div>

                    {listing.description && (
                        <div>
                            <h3 className="font-semibold text-lg text-foreground/90 mb-1">Description:</h3>
                            <p className="text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-md border">
                                {listing.description}
                            </p>
                        </div>
                    )}

                    {listing.tags && listing.tags.length > 0 && (
                        <div className="pt-2">
                             <h3 className="font-semibold text-sm text-muted-foreground mb-1.5">Tags:</h3>
                            <div className="flex flex-wrap gap-2">
                                {listing.tags.map(tag => (
                                    <Badge key={tag} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-0 mt-auto pt-6">
                    <Button size="lg" className="w-full" onClick={() => alert(`Contacting ${listing.sellerName} about "${listing.title}" (Feature not implemented)`)}>
                        <MessageSquare className="w-5 h-5 mr-2" /> Contact Seller
                    </Button>
                </CardFooter>
            </div>
        </div>
      </Card>
    </div>
  );
}
