import { getAquariums } from '@/lib/actions/aquarium';
import { AquariumCard } from '@/components/aquariums/aquarium-card';
import { Button } from '@/components/ui/button';
import { Plus, Fish } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';

export default async function AquariumsPage() {
  const { aquariums, error } = await getAquariums();

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Aquariums' },
        ]}
        className="mb-4"
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Aquariums</h1>
          <p className="text-muted-foreground">
            Manage your aquarium collection
          </p>
        </div>
        <Button asChild>
          <Link href="/aquariums/new">
            <Plus className="h-4 w-4 mr-2" />
            New Aquarium
          </Link>
        </Button>
      </div>

      {/* Aquariums Grid */}
      {!aquariums || aquariums.length === 0 ? (
        <EmptyState
          title="No aquariums yet"
          description="Get started by creating your first aquarium."
          icon={<Fish className="w-10 h-10" />}
          action={(
            <Button asChild size="sm">
              <Link href="/aquariums/new">
                <Plus className="h-4 w-4 mr-2" /> Create Your First Aquarium
              </Link>
            </Button>
          )}
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aquariums.map((aquarium) => (
            <AquariumCard key={aquarium.id} aquarium={aquarium} />
          ))}
        </div>
      )}
    </div>
  );
}
