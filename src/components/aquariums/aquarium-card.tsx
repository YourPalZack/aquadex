'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Fish, 
  Droplet, 
  Calendar, 
  MapPin, 
  Edit, 
  Trash2,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Aquarium } from '@/types/aquarium';
import { formatDistanceToNow } from 'date-fns';

interface AquariumCardProps {
  aquarium: Aquarium;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function AquariumCard({ aquarium, onDelete, showActions = true }: AquariumCardProps) {
  const waterTypeColors = {
    freshwater: 'bg-blue-500',
    saltwater: 'bg-cyan-500',
    brackish: 'bg-teal-500',
  };

  const waterTypeLabels = {
    freshwater: 'Freshwater',
    saltwater: 'Saltwater',
    brackish: 'Brackish',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {aquarium.imageUrls && aquarium.imageUrls.length > 0 && (
        <div className="relative h-48 w-full">
          <Image
            src={aquarium.imageUrls[0]}
            alt={aquarium.name}
            fill
            className="object-cover"
          />
          {!aquarium.isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Inactive</Badge>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-primary" />
              {aquarium.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {aquarium.sizeGallons} gallons
            </CardDescription>
          </div>
          <Badge className={waterTypeColors[aquarium.waterType]}>
            {waterTypeLabels[aquarium.waterType]}
          </Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-2">
        {aquarium.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{aquarium.location}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Setup {formatDistanceToNow(new Date(aquarium.setupDate), { addSuffix: true })}
          </span>
        </div>

        {aquarium.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-4">
            {aquarium.notes}
          </p>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter className="flex gap-2 pt-4">
          <Button asChild variant="default" className="flex-1">
            <Link href={`/aquariums/${aquarium.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="icon">
            <Link href={`/aquariums/${aquarium.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onDelete(aquarium.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

// Skeleton loading state
export function AquariumCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 w-full bg-muted animate-pulse" />
      <CardHeader>
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
      </CardContent>
      <CardFooter>
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}
