import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StoreListItem } from '@/types/store';
import { MapPin, Globe, Phone, ShieldCheck, Building } from 'lucide-react';

export interface StoreCardProps { store: StoreListItem }

export function StoreCard({ store }: StoreCardProps) {
  const image = store.gallery_images?.[0];
  const verified = store.verification_status === 'verified';

  return (
    <Card className="w-full shadow hover:shadow-lg transition-shadow duration-300 flex flex-col bg-card h-full">
      {image && (
        <Link href={`/local-fish-stores/${store.slug}`}>
          <div className="aspect-[16/9] relative w-full rounded-t-lg overflow-hidden bg-muted border-b">
            <Image src={image} alt={`${store.business_name} image`} fill className="object-cover" />
            {verified && (
              <Badge className="absolute top-2 right-2 bg-green-600"> <ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>
            )}
          </div>
        </Link>
      )}

      <CardHeader className="pb-3 pt-4">
        <Link href={`/local-fish-stores/${store.slug}`}>
          <CardTitle className="text-lg flex items-center hover:text-primary transition-colors">
            <Building className="h-5 w-5 mr-2 text-primary" />
            {store.business_name}
          </CardTitle>
        </Link>
        <CardDescription className="flex items-center text-sm pt-1 gap-2 flex-wrap">
          <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
          <span>
            {store.city}, {store.state} {store.zip}
          </span>
          {typeof store.distance_miles === 'number' && !Number.isNaN(store.distance_miles) && (
            <span className="text-muted-foreground/80">• {store.distance_miles.toFixed(1)} mi</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-2 py-2">
        {store.phone && (
          <p className="text-sm text-foreground/80 flex items-center">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" /> {store.phone}
          </p>
        )}
        {store.website && (
          <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center">
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" /> Visit Website
          </a>
        )}
        {store.categories && store.categories.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Specialties:</h4>
            <div className="flex flex-wrap gap-1.5">
              {store.categories.slice(0, 3).map((c) => (
                <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
              ))}
              {store.categories.length > 3 && <Badge variant="secondary" className="text-xs">+{store.categories.length - 3} more</Badge>}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t mt-auto">
        <Link href={`/local-fish-stores/${store.slug}`} className="text-sm text-primary hover:underline">
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
