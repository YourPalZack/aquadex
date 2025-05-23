
'use client';

import type { Aquarium } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, CalendarDays, Pencil, Trash2, Edit3, AlertTriangle, BellRing, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isPast, isToday, isFuture } from 'date-fns';

interface AquariumCardProps {
  aquarium: Aquarium;
  onEdit: (aquariumId: string) => void;
  onDelete: (aquariumId: string) => void;
}

export default function AquariumCard({ aquarium, onEdit, onDelete }: AquariumCardProps) {
  const getReminderStatus = (reminderDate?: Date): { text: string; icon: React.ReactNode; className: string } | null => {
    if (!reminderDate) return null;

    const today = new Date();
    const reminder = new Date(reminderDate);
    const daysDiff = differenceInDays(reminder, today);

    if (isPast(reminder) && !isToday(reminder)) {
      return { text: `Overdue since ${format(reminder, 'MMM d')}`, icon: <AlertTriangle className="w-4 h-4 mr-2" />, className: 'text-destructive' };
    }
    if (isToday(reminder)) {
      return { text: 'Due Today!', icon: <BellRing className="w-4 h-4 mr-2" />, className: 'text-amber-600 dark:text-amber-500 font-semibold' };
    }
    if (daysDiff >= 0 && daysDiff <= 3) {
      return { text: `Due in ${daysDiff + 1} day(s) (${format(reminder, 'MMM d')})`, icon: <BellRing className="w-4 h-4 mr-2" />, className: 'text-amber-600 dark:text-amber-500' };
    }
    if (isFuture(reminder)) {
      return { text: `Next: ${format(reminder, 'MMM d, yyyy')}`, icon: <CalendarClock className="w-4 h-4 mr-2" />, className: 'text-muted-foreground' };
    }
    return null;
  };

  const reminderStatus = getReminderStatus(aquarium.nextWaterChangeReminder);

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
            Last Change: {format(new Date(aquarium.lastWaterChange), 'MMM d, yyyy')}
          </div>
        )}
        {reminderStatus && (
          <div className={cn("flex items-center text-sm", reminderStatus.className)}>
            {reminderStatus.icon}
            {reminderStatus.text}
          </div>
        )}
        {!reminderStatus && aquarium.nextWaterChangeReminder && ( // Fallback for dates far in future if not caught by logic
            <div className="flex items-center text-sm text-muted-foreground">
                <CalendarClock className="w-4 h-4 mr-2" />
                Next Reminder: {format(new Date(aquarium.nextWaterChangeReminder), 'MMM d, yyyy')}
            </div>
        )}
        {aquarium.notes && (
          <div>
            <h4 className="font-semibold text-sm mt-2">Notes:</h4>
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
