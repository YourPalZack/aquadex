import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessHoursDisplay } from '@/components/local-fish-stores/BusinessHoursDisplay';
import { StoreGallery } from '@/components/local-fish-stores/StoreGallery';
import { EmailVerificationBanner } from '@/components/shared/EmailVerificationBanner';

async function DashboardContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    return <div className="text-destructive">Failed to load your store.</div>;
  }

  const store = stores?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Store Dashboard</h1>
        <p className="text-muted-foreground">Manage your store details and gallery.</p>
      </div>

      {!user.email_confirmed_at && (
        <EmailVerificationBanner email={user.email} />
      )}

      {!store ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm">You don’t have a store yet. Get started by creating one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessHoursDisplay businessHours={store.business_hours as any} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <StoreGallery images={(store.gallery_images as string[]) || []} storeName={store.business_name} />
              <p className="text-xs text-muted-foreground mt-2">Image uploads are currently disabled until the storage bucket is created.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="p-8">Loading…</CardContent>
    </Card>
  );
}

export default function StoreDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Suspense fallback={<LoadingState />}> 
        <DashboardContent />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'Store Dashboard - AquaDex',
  description: 'Manage your store on AquaDex.',
};
