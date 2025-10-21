import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAquarium } from '@/lib/database';
import AquariumPhotoUpload from '@/components/aquariums/AquariumPhotoUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getServerAuth() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function AquariumPhotosContent({ aquariumId }: { aquariumId: string }) {
  const user = await getServerAuth();
  
  if (!user) {
    redirect('/auth/signin');
  }

  const aquarium = await getAquarium(aquariumId);

  if (!aquarium || aquarium.user_id !== user.id) {
    redirect('/aquariums');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Photos</h1>
          <p className="text-muted-foreground">{aquarium.name}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/aquariums/${aquariumId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Aquarium
          </Link>
        </Button>
      </div>

      <AquariumPhotoUpload
        aquariumId={aquariumId}
        existingPhotos={aquarium.image_urls || []}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading...</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

export default function AquariumPhotosPage({ params }: { params: { aquariumId: string } }) {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Suspense fallback={<LoadingState />}>
        <AquariumPhotosContent aquariumId={params.aquariumId} />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'Manage Aquarium Photos - AquaDex',
  description: 'Upload and manage photos of your aquarium.',
};