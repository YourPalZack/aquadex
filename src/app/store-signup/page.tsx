import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StoreSignupForm } from '@/components/local-fish-stores/StoreSignupForm';
import { EmailVerificationBanner } from '@/components/shared/EmailVerificationBanner';

async function StoreSignupContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const emailUnverified = !user.email_confirmed_at;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Register Your Store</h1>
        <p className="text-muted-foreground">Join the AquaDex directory and reach more fishkeepers nearby.</p>
      </div>

      {emailUnverified && (
        <EmailVerificationBanner email={user.email} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent>
          <StoreSignupForm onSuccess={() => { /* navigation can be added after store dashboard exists */ }} />
        </CardContent>
      </Card>
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

export default function StoreSignupPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Suspense fallback={<LoadingState />}> 
        <StoreSignupContent />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'Store Signup - AquaDex',
  description: 'Register your local fish store on AquaDex.',
};
