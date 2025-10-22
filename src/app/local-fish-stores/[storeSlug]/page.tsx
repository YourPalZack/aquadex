
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStoreBySlugAction } from '@/lib/actions/store-supabase';
import { BusinessHoursDisplay, StoreGallery } from '@/components/local-fish-stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Phone, Globe, ShieldCheck, Building } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default async function LocalFishStoreProfilePage({ params }: { params: { storeSlug: string } }) {
  const slug = params.storeSlug;
  const result = await getStoreBySlugAction(slug);

  if (!result.success) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader><CardTitle>Store Not Found</CardTitle></CardHeader>
          <CardContent>
            <p>The store you are looking for does not exist or could not be loaded.</p>
            <Button variant="outline" asChild className="mt-6">
              <Link href="/local-fish-stores"><ArrowLeft className="mr-2 h-4 w-4" />Back to Store Finder</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const store = result.data as any;
  const verified = store.verification_status === 'verified';
  const categories: string[] = store.categories || [];
  const images: string[] = store.gallery_images || [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Breadcrumbs
        className="mb-2"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Local Fish Stores', href: '/local-fish-stores' },
          { label: store.business_name },
        ]}
      />
      <div>
        <Button variant="outline" asChild className="mb-6 shadow-sm">
          <Link href="/local-fish-stores">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store Finder
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="border-b bg-card">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl lg:text-4xl flex items-center text-primary">
              <Building className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
              {store.business_name}
            </CardTitle>
            {verified && (
              <Badge className="bg-green-600"><ShieldCheck className="h-4 w-4 mr-1" /> Verified</Badge>
            )}
          </div>
          <CardDescription className="text-base mt-2 ml-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            {store.street}, {store.city}, {store.state} {store.zip}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 grid md:grid-cols-3 gap-x-10 gap-y-8">
          <div className="md:col-span-2 space-y-6">
            {images.length > 0 && (
              <StoreGallery images={images} storeName={store.business_name} />
            )}

            {store.description && (
              <div>
                <h3 className="font-semibold text-xl text-foreground/90 mb-2">About This Store</h3>
                <p className="text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-md border">
                  {store.description}
                </p>
              </div>
            )}

            {categories.length > 0 && (
              <div>
                <h3 className="font-semibold text-xl text-foreground/90 mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Badge key={c} variant="secondary" className="px-3 py-1 text-sm">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-background shadow-sm md:col-span-1">
            <h3 className="font-semibold text-xl text-foreground/90 mb-3 border-b pb-2">Store Information</h3>
            {store.phone && (
              <p className="flex items-center text-foreground/90"><Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {store.phone}</p>
            )}
            {store.website && (
              <a
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                <Globe className="w-4 h-4 mr-2 text-muted-foreground" /> Visit Website
              </a>
            )}
            <Separator className="my-3" />
            {store.business_hours && (
              <div>
                <h4 className="font-semibold text-md text-foreground/90 mb-2">Operating Hours</h4>
                <BusinessHoursDisplay businessHours={store.business_hours} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { storeSlug: string } }) {
  const slug = params.storeSlug;
  const result = await getStoreBySlugAction(slug);
  if (!result.success) {
    return {
      title: 'Store Not Found · Local Fish Stores',
      description: 'This store does not exist or could not be loaded.',
    } as const;
  }
  const store: any = result.data;
  const title = `${store.business_name} · ${store.city}, ${store.state}`;
  const description = store.description?.slice(0, 160) || `View ${store.business_name} in ${store.city}, ${store.state}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  } as const;
}

    