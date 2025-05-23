
'use client';

import type { Aquarium } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Droplet, CalendarDays, Pencil, Trash2, Edit3, AlertTriangle, BellRing, CalendarClock,
    FishSymbol, Users, Leaf, Filter, Info, Image as ImageIcon, Utensils, Timer, Pipette
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isPast, isToday, isFuture } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link'; 

interface AquariumCardProps {
  aquarium: Aquarium;
  onEdit: (aquariumId: string) => void;
  onDelete: (aquariumId: string) => void;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label?: string; value?: React.ReactNode; className?: string; children?: React.ReactNode }> = ({ icon, label, value, children, className }) => (
  <div className={cn("flex items-start text-sm", className)}>
    <div className="flex-shrink-0 w-5 h-5 mr-2 text-muted-foreground">{icon}</div>
    <div>
      {label && <span className="font-medium">{label}: </span>}
      {value && <span className="text-foreground/90">{value}</span>}
      {children}
    </div>
  </div>
);


export default function AquariumCard({ aquarium, onEdit, onDelete }: AquariumCardProps) {
  const getWaterChangeReminderStatus = (reminderDate?: Date): { text: string; icon: React.ReactNode; className: string } | null => {
    if (!reminderDate) return null;

    const today = new Date();
    today.setHours(0,0,0,0);
    const reminder = new Date(reminderDate);
    reminder.setHours(0,0,0,0);
    const daysDiff = differenceInDays(reminder, today);

    if (isPast(reminder) && !isToday(reminder)) {
      return { text: `Water Change Overdue by ${Math.abs(daysDiff)} day(s) (was ${format(reminder, 'MMM d')})`, icon: <AlertTriangle className="w-4 h-4 mr-1" />, className: 'text-destructive font-semibold' };
    }
    if (isToday(reminder)) {
      return { text: 'Water Change Due Today!', icon: <BellRing className="w-4 h-4 mr-1" />, className: 'text-amber-600 dark:text-amber-500 font-semibold' };
    }
    if (daysDiff >= 0 && daysDiff <= 3) {
      return { text: `Water Change Due in ${daysDiff + 1} day(s) (${format(reminder, 'MMM d')})`, icon: <BellRing className="w-4 h-4 mr-1" />, className: 'text-amber-600 dark:text-amber-500' };
    }
    if (isFuture(reminder)) {
      return { text: `Next Water Change: ${format(reminder, 'MMM d, yyyy')}`, icon: <CalendarClock className="w-4 h-4 mr-1" />, className: 'text-muted-foreground' };
    }
    return null;
  };

  const getFeedingReminderStatus = (reminderDate?: Date): { text: string; icon: React.ReactNode; className: string } | null => {
    if (!reminderDate) return null;

    const today = new Date();
    today.setHours(0,0,0,0);
    const reminder = new Date(reminderDate);
    reminder.setHours(0,0,0,0);
    const daysDiff = differenceInDays(reminder, today);

    if (isPast(reminder) && !isToday(reminder)) {
      return { text: `Feeding Overdue (was ${format(reminder, 'MMM d')})`, icon: <AlertTriangle className="w-4 h-4 mr-1" />, className: 'text-destructive font-semibold' };
    }
    if (isToday(reminder)) {
      return { text: 'Feeding Due Today!', icon: <Timer className="w-4 h-4 mr-1" />, className: 'text-amber-600 dark:text-amber-500 font-semibold' };
    }
    if (isFuture(reminder)) {
      return { text: `Next Feeding: ${format(reminder, 'MMM d, yyyy')}`, icon: <Timer className="w-4 h-4 mr-1" />, className: 'text-muted-foreground' };
    }
    return null;
  };

  const waterChangeReminderStatus = getWaterChangeReminderStatus(aquarium.nextWaterChangeReminder);
  const feedingReminderStatus = getFeedingReminderStatus(aquarium.nextFeedingReminder);

  const sourceWaterTypeDisplay = aquarium.sourceWaterType ? 
    (aquarium.sourceWaterType === 'ro' ? 'R/O Water' : aquarium.sourceWaterType === 'premixed_saltwater' ? 'Pre-mixed Saltwater' : 'Tap Water')
    : 'Not Specified';

  return (
    <Card className="w-full shadow-lg flex flex-col h-full bg-card hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <Link href={`/aquariums/${aquarium.id}`} passHref legacyBehavior>
            <a className="group">
              <CardTitle className="text-xl flex items-center group-hover:text-primary/80 transition-colors">
                <Droplet className="w-6 h-6 mr-2 text-primary" />
                {aquarium.name}
              </CardTitle>
            </a>
          </Link>
          <Badge variant={aquarium.type === 'freshwater' ? 'secondary' : aquarium.type === 'saltwater' ? 'default' : 'outline' } className="capitalize">
            {aquarium.type}
          </Badge>
        </div>
        {aquarium.volumeGallons && (
          <CardDescription>{aquarium.volumeGallons} Gallons</CardDescription>
        )}
      </CardHeader>
      
      {aquarium.imageUrl && (
        <div className="px-6 pb-0 -mt-2 mb-4">
         <Link href={`/aquariums/${aquarium.id}`} passHref legacyBehavior>
            <a className="block aspect-video relative rounded-md overflow-hidden border group">
                <Image 
                    src={aquarium.imageUrl} 
                    alt={`Image of ${aquarium.name}`} 
                    layout="fill" 
                    objectFit="cover"
                    data-ai-hint="aquarium fish tank"
                    className="bg-muted group-hover:opacity-90 transition-opacity"
                />
            </a>
          </Link>
        </div>
      )}
      
      <CardContent className="space-y-3 flex-grow pb-4">
        {waterChangeReminderStatus && (
            <div className={cn("flex items-center text-sm p-2 rounded-md", 
                waterChangeReminderStatus.className.includes('destructive') ? 'bg-destructive/10 border border-destructive/30' : 
                waterChangeReminderStatus.className.includes('amber') ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-muted/50 border border-border'
            )}>
            {waterChangeReminderStatus.icon}
            <span className="ml-1">{waterChangeReminderStatus.text}</span>
            </div>
        )}
         {aquarium.lastWaterChange && (!waterChangeReminderStatus || (waterChangeReminderStatus && (isFuture(new Date(aquarium.nextWaterChangeReminder!)) && differenceInDays(new Date(aquarium.nextWaterChangeReminder!), new Date()) > 3))) && (
          <DetailItem icon={<CalendarDays />} value={`Last Change: ${format(new Date(aquarium.lastWaterChange), 'MMM d, yyyy')}`} />
        )}

        {feedingReminderStatus && (
            <div className={cn("flex items-center text-sm p-2 rounded-md mt-2", 
                feedingReminderStatus.className.includes('destructive') ? 'bg-destructive/10 border border-destructive/30' : 
                feedingReminderStatus.className.includes('amber') ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-muted/50 border border-border'
            )}>
            {feedingReminderStatus.icon}
            <span className="ml-1">{feedingReminderStatus.text}</span>
            </div>
        )}

        {(aquarium.fishSpecies || aquarium.fishCount !== undefined || typeof aquarium.co2Injection === 'boolean' || aquarium.filterDetails || aquarium.foodDetails || aquarium.sourceWaterType) && (
            <Separator className="my-3" />
        )}
        
        {aquarium.fishSpecies && <DetailItem icon={<FishSymbol />} label="Species" value={aquarium.fishSpecies} />}
        {aquarium.fishCount !== undefined && <DetailItem icon={<Users />} label="Count" value={aquarium.fishCount.toString()} />}
        {typeof aquarium.co2Injection === 'boolean' && <DetailItem icon={<Leaf />} label="CO2" value={aquarium.co2Injection ? 'Yes' : 'No'} />}
        {aquarium.filterDetails && <DetailItem icon={<Filter />} label="Filter" value={aquarium.filterDetails} />}
        {aquarium.foodDetails && <DetailItem icon={<Utensils />} label="Food" value={aquarium.foodDetails} />}
        
        {aquarium.sourceWaterType && (
          <DetailItem icon={<Pipette />} label="Source Water" value={sourceWaterTypeDisplay}>
            {aquarium.sourceWaterParameters && (
              <p className="text-xs text-muted-foreground mt-1 ml-0 pl-0 bg-muted/30 p-1.5 rounded-md border whitespace-pre-wrap">{aquarium.sourceWaterParameters}</p>
            )}
          </DetailItem>
        )}


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

