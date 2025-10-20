import { notFound } from 'next/navigation';
import { getAquariumById, getLivestock } from '@/lib/actions/aquarium';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Edit, Calendar, Hash, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface LivestockDetailPageProps {
  params: {
    aquariumId: string;
    livestockId: string;
  };
}

export default async function LivestockDetailPage({ params }: LivestockDetailPageProps) {
  const { aquariumId, livestockId } = params;

  // Fetch data
  const [aquariumResult, livestockResult] = await Promise.all([
    getAquariumById(aquariumId),
    getLivestock({ aquariumId }),
  ]);

  if (aquariumResult.error || !aquariumResult.aquarium) {
    notFound();
  }

  const livestock = livestockResult.livestock?.find((l: any) => l.id === livestockId);

  if (!livestock) {
    notFound();
  }

  const { aquarium } = aquariumResult;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fish':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'coral':
        return 'bg-pink-500/10 text-pink-700 dark:text-pink-400';
      case 'plant':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'invertebrate':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href={`/aquariums/${aquariumId}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to {aquarium.name}
          </Link>
        </Button>
      </div>

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                {livestock.species}
              </CardTitle>
              {livestock.commonName && (
                <p className="text-lg text-muted-foreground mb-3">
                  {livestock.commonName}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getTypeColor(livestock.type)}>
                  {livestock.type}
                </Badge>
                <Badge variant="outline">
                  Quantity: {livestock.quantity}
                </Badge>
                {!livestock.isAlive && (
                  <Badge variant="destructive">
                    Deceased
                  </Badge>
                )}
              </div>
            </div>
            {livestock.imageUrl && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden ml-4">
                <Image
                  src={livestock.imageUrl}
                  alt={livestock.species}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/aquariums/${aquariumId}/livestock/${livestockId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Livestock
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scientific Information */}
        <Card>
          <CardHeader>
            <CardTitle>Scientific Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {livestock.scientificName && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Scientific Name</p>
                <p className="font-medium italic">{livestock.scientificName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Type</p>
              <p className="font-medium capitalize">{livestock.type}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Added Date</p>
                <p className="font-medium">
                  {format(new Date(livestock.addedDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Hash className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{livestock.quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {livestock.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {livestock.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
