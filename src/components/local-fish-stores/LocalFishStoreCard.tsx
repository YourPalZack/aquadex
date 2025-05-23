
'use client';

import type { LocalFishStore } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Globe, ArrowRight, ShieldCheck, Building } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LocalFishStoreCardProps {
  store: LocalFishStore;
}

export default function LocalFishStoreCard({ store }: LocalFishStoreCardProps) {
  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card h-full">
      {store.imageUrl && (
        <Link href={`/local-fish-stores/${store.slug}`} passHref>
          <div className="aspect-[16/9] relative w-full rounded-t-lg overflow-hidden bg-muted border-b cursor-pointer">
            <Image 
              src={store.imageUrl} 
              alt={`Image of ${store.name}`} 
              layout="fill" 
              objectFit="cover"
              data-ai-hint={store.imageHint || 'fish store exterior'}
            />
            {store.isVerified && (
              <Badge variant="default" className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-xs py-1 px-2 shadow-md">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified
              </Badge>
            )}
          </div>
        </Link>
      )}
      <CardHeader className="pb-3 pt-4">
        <Link href={`/local-fish-stores/${store.slug}`} passHref>
            <CardTitle className="text-xl flex items-center hover:text-primary transition-colors cursor-pointer">
                <Building className="w-5 h-5 mr-2 text-primary" />
                {store.name}
            </CardTitle>
        </Link>
        <CardDescription className="flex items-center text-sm pt-1">
          <MapPin className="w-4 h-4 mr-1.5 text-muted-foreground" />
          {store.city}, {store.state} {store.zipCode}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 py-2">
        {store.phone && (
          <p className="text-sm text-foreground/80 flex items-center">
            <Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {store.phone}
          </p>
        )}
        {store.website && (
          <a 
            href={store.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-primary hover:underline flex items-center"
          >
            <Globe className="w-4 h-4 mr-2 text-muted-foreground" /> Visit Website
          </a>
        )}
        {store.services && store.services.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Services:</h4>
            <div className="flex flex-wrap gap-1.5">
              {store.services.slice(0, 3).map(service => ( // Show up to 3 services
                <Badge key={service} variant="secondary" className="text-xs">{service}</Badge>
              ))}
              {store.services.length > 3 && <Badge variant="secondary" className="text-xs">+{store.services.length - 3} more</Badge>}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 border-t mt-auto">
        <Button asChild variant="outline" className="w-full hover:border-primary/70">
          <Link href={`/local-fish-stores/${store.slug}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
