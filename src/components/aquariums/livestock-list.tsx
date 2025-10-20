'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { deleteLivestock } from '@/lib/actions/aquarium';
import type { Livestock } from '@/types/aquarium';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Fish, Trash2, Edit, Plus } from 'lucide-react';

interface LivestockListProps {
  livestock: Livestock[];
  aquariumId: string;
  showActions?: boolean;
}

export function LivestockList({ livestock, aquariumId, showActions = true }: LivestockListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteLivestock(id);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Livestock removed successfully',
      });
      router.refresh();
    }
    setDeletingId(null);
  };

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

  if (!livestock || livestock.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Fish className="h-16 w-16 mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-xl font-semibold mb-2">No livestock yet</h3>
          <p className="text-muted-foreground mb-6 text-center">
            Start adding fish, coral, plants, or invertebrates to track your aquarium inhabitants
          </p>
          {showActions && (
            <Button asChild>
              <Link href={`/aquariums/${aquariumId}/livestock/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Livestock
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Livestock ({livestock.length})</h3>
            <p className="text-sm text-muted-foreground">
              Manage your aquarium inhabitants
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={`/aquariums/${aquariumId}/livestock/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Livestock
            </Link>
          </Button>
        </div>
      )}

      {/* Livestock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {livestock.map((item) => (
          <Card key={item.id} className={!item.isAlive ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {item.species}
                    {!item.isAlive && (
                      <Badge variant="secondary" className="text-xs">
                        Deceased
                      </Badge>
                    )}
                  </CardTitle>
                  {item.commonName && (
                    <CardDescription className="text-sm mt-1">
                      {item.commonName}
                    </CardDescription>
                  )}
                </div>
                {item.imageUrl && (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden ml-3 flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.species}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Type and Quantity Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getTypeColor(item.type)}>
                  {item.type}
                </Badge>
                <Badge variant="outline">
                  Qty: {item.quantity}
                </Badge>
              </div>

              {/* Scientific Name */}
              {item.scientificName && (
                <p className="text-sm text-muted-foreground italic">
                  {item.scientificName}
                </p>
              )}

              {/* Added Date */}
              <p className="text-xs text-muted-foreground">
                Added {format(new Date(item.addedDate), 'MMM dd, yyyy')}
              </p>

              {/* Notes Preview */}
              {item.notes && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.notes}
                </p>
              )}

              {/* Actions */}
              {showActions && (
                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href={`/aquariums/${aquariumId}/livestock/${item.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                  >
                    <Link href={`/aquariums/${aquariumId}/livestock/${item.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deletingId === item.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Livestock?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {item.species}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
