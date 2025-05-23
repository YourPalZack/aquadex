
'use client';

import type { Aquarium } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, CalendarDays, Pencil, Trash2, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AquariumCardProps {
  aquarium: Aquarium;
  onEdit: (aquariumId: string) => void;
  onDelete: (aquariumId: string) => void;
}

export default function AquariumCard({ aquarium, onEdit, onDelete }: AquariumCardProps) {
  return (
    <Card className="w-full shadow-lg flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl flex items-center">
            <Droplet className="w-6 h-6 mr-2 text-primary" />
            {aquarium.name}
          </CardTitle>
          <Badge variant={aquarium.type === 'freshwater' ? 'secondary' : aquarium.type === 'saltwater' ? 'default' : 'outline' } className="capitalize">
            {aquarium.type}
          </Badge>
        </div>
        {aquarium.volumeGallons && (
          <CardDescription>{aquarium.volumeGallons} Gallons</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        {aquarium.lastWaterChange && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 mr-2" />
            Last Water Change: {new Date(aquarium.lastWaterChange).toLocaleDateString()}
          </div>
        )}
        {aquarium.nextWaterChangeReminder && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 mr-2 text-amber-600" />
            Next Reminder: {new Date(aquarium.nextWaterChangeReminder).toLocaleDateString()}
          </div>
        )}
        {aquarium.notes && (
          <div>
            <h4 className="font-semibold text-sm">Notes:</h4>
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md whitespace-pre-wrap">
              {aquarium.notes}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(aquarium.id)}>
          <Edit3 className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(aquarium.id)}>
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
