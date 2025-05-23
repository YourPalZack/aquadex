
'use client';

import type { Aquarium } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Droplet, CalendarDays, Pencil, Trash2, Edit3, AlertTriangle, BellRing, CalendarClock,
    FishSymbol, Users, Leaf, Filter, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isPast, isToday, isFuture } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface AquariumCardProps {
  aquarium: Aquarium;
  onEdit: (aquariumId: string) => void;
  onDelete: (aquariumId: string) => void;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label?: string; value: React.ReactNode; className?: string }> = ({ icon, label, value, className }) => (
  <div className={cn("flex items-start text-sm", className)}>
    <div className="flex-shrink-0 w-5 h-5 mr-2 text-muted-foreground">{icon}</div>
    <div>
      {label && <span className="font-medium">{label}: </span>}
      <span className="text-foreground/90">{value}</span>
    </div>
  </div>
);


export default function AquariumCard({ aquarium, onEdit, onDelete }: AquariumCardProps) {
  const getReminderStatus = (reminderDate?: Date): { text: string; icon: React.ReactNode; className: string } | null => {
    if (!reminderDate) return null;

    const today = new Date();
    const reminder = new Date(reminderDate);
    const daysDiff = differenceInDays(reminder, today);

    if (isPast(reminder) && !isToday(reminder)) {
      return { text: `Overdue since ${format(reminder, 'MMM d')}`, icon: <AlertTriangle className="w-4 h-4 mr-1" />, className: 'text-destructive font-semibold' };
    }
    if (isToday(reminder)) {
      return { text: 'Due Today!', icon: <BellRing className="w-4 h-4 mr-1" />, className: 'text-amber-600 dark:text-amber-500 font-semibold' };
    }
    if (daysDiff >= 0 && daysDiff <= 3) {
      return { text: `Due in ${daysDiff + 1} day(s) (${format(reminder, 'MMM d')})`, icon: <BellRing className="w-4 h-4 mr-1" />, className: 'text-amber-600 dark:text-amber-500' };
    }
    if (isFuture(reminder)) {
      return { text: `Next: ${format(reminder, 'MMM d, yyyy')}`, icon: <CalendarClock className="w-4 h-4 mr-1" />, className: 'text-muted-foreground' };
    }
    return null;
  };

  const reminderStatus = getReminderStatus(aquarium.nextWaterChangeReminder);

  return (
    <Card className="w-full shadow-lg flex flex-col h-full bg-card hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
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
      <CardContent className="space-y-3 flex-grow pb-4">
        {reminderStatus && (
            <div className={cn("flex items-center text-sm p-2 rounded-md", 
                reminderStatus.className.includes('destructive') ? 'bg-destructive/10' : 
                reminderStatus.className.includes('amber') ? 'bg-amber-500/10' : 'bg-muted/50'
            )}>
            {reminderStatus.icon}
            <span className="ml-1">{reminderStatus.text}</span>
            </div>
        )}
         {aquarium.lastWaterChange && !reminderStatus && (
          <DetailItem icon={<CalendarDays />} value={`Last Change: ${format(new Date(aquarium.lastWaterChange), 'MMM d, yyyy')}`} />
        )}
         {!reminderStatus && aquarium.nextWaterChangeReminder && (
            <DetailItem icon={<CalendarClock />} value={`Next Reminder: ${format(new Date(aquarium.nextWaterChangeReminder), 'MMM d, yyyy')}`} />
        )}

        {(aquarium.fishSpecies || aquarium.fishCount !== undefined || typeof aquarium.co2Injection === 'boolean' || aquarium.filterDetails) && (
            <Separator className="my-3" />
        )}
        
        {aquarium.fishSpecies && <DetailItem icon={<FishSymbol />} label="Species" value={aquarium.fishSpecies} />}
        {aquarium.fishCount !== undefined && <DetailItem icon={<Users />} label="Count" value={aquarium.fishCount.toString()} />}
        {typeof aquarium.co2Injection === 'boolean' && <DetailItem icon={<Leaf />} label="CO2" value={aquarium.co2Injection ? 'Yes' : 'No'} />}
        {aquarium.filterDetails && <DetailItem icon={<Filter />} label="Filter" value={aquarium.filterDetails} />}

        {aquarium.notes && (
          <>
            <Separator className="my-3" />
            <div>
              <h4 className="font-semibold text-sm mb-1 flex items-center"><Info className="w-4 h-4 mr-2 text-muted-foreground"/>Notes:</h4>
              <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-md whitespace-pre-wrap text-foreground/80">
                {aquarium.notes}
              </p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
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
