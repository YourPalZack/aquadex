import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getUserAquariums } from '@/lib/database';
import WaterTestForm from '@/components/aquariums/WaterTestForm';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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

async function WaterTestFormData() {
  const user = await getServerAuth();
  
  if (!user) {
    redirect('/auth/signin');
  }

  const aquariums = await getUserAquariums(user.id);

  return <WaterTestForm aquariums={aquariums} />;
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

export default function AddWaterTestPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Suspense fallback={<LoadingState />}>
        <WaterTestFormData />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'Add Water Test - AquaDex',
  description: 'Record a new water quality test for your aquarium.',
};