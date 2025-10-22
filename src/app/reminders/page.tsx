
'use client';

import { useState, useEffect } from 'react';
import type { Aquarium, ReminderItem } from '@/types';
import { mockAquariumsData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing, CalendarDays, Timer, AlertTriangle, Info, Eye } from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays, isPast, isToday, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';

const getReminderStatus = (
  dueDate: Date,
  type: 'Water Change' | 'Feeding',
  aquariumName: string
): Pick<ReminderItem, 'status' | 'message' | 'daysDiff'> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reminderDate = new Date(dueDate);
  reminderDate.setHours(0, 0, 0, 0);
  const daysDiff = differenceInDays(reminderDate, today);

  let status: ReminderItem['status'];
  let message: string;

  if (isPast(reminderDate) && !isToday(reminderDate)) {
    status = 'Overdue';
    message = `${aquariumName}: ${type} Overdue by ${Math.abs(daysDiff)} day(s) (was ${format(reminderDate, 'MMM d')})`;
  } else if (isToday(reminderDate)) {
    status = 'Due Today';
    message = `${aquariumName}: ${type} Due Today!`;
  } else if (daysDiff >= 0 && daysDiff <= 3) { // Due in 0, 1, 2, 3 days
    status = 'Due Soon';
    message = `${aquariumName}: ${type} Due in ${daysDiff +1} day(s) (${format(reminderDate, 'MMM d')})`;
  } else {
    status = 'Upcoming';
    message = `${aquariumName}: Next ${type} on ${format(reminderDate, 'MMM d, yyyy')}`;
  }
  return { status, message, daysDiff };
};

const ReminderCard: React.FC<{ reminder: ReminderItem }> = ({ reminder }) => {
  let icon: React.ReactNode;
  let cardClassName = "border-l-4 ";
  let iconColor = "text-primary";

  if (reminder.status === 'Overdue') {
    icon = <AlertTriangle className="h-5 w-5 text-destructive" />;
    cardClassName += "border-destructive bg-destructive/10";
    iconColor = "text-destructive";
  } else if (reminder.status === 'Due Today') {
    icon = <BellRing className="h-5 w-5 text-amber-600 dark:text-amber-500" />;
    cardClassName += "border-amber-500 bg-amber-500/10";
    iconColor = "text-amber-600 dark:text-amber-500";
  } else if (reminder.status === 'Due Soon') {
    icon = <BellRing className="h-5 w-5 text-sky-600 dark:text-sky-500" />;
    cardClassName += "border-sky-500 bg-sky-500/10";
    iconColor = "text-sky-600 dark:text-sky-500";
  } else { // Upcoming
    icon = reminder.type === 'Water Change' ? <CalendarDays className={`h-5 w-5 ${iconColor}`} /> : <Timer className={`h-5 w-5 ${iconColor}`} />;
    cardClassName += "border-border bg-card";
  }

  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-shadow", cardClassName)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`mt-1 ${iconColor}`}>{icon}</div>
          <div className="flex-grow">
            <h3 className="font-semibold text-foreground/90">{reminder.type} - <Link href={`/aquariums/${reminder.aquariumId}`} className="text-primary hover:underline">{reminder.aquariumName}</Link></h3>
            <p className="text-sm text-muted-foreground">{reminder.message}</p>
            <p className="text-xs text-muted-foreground mt-1">Due: {format(reminder.dueDate, 'PPP')}</p>
          </div>
          <Button variant="outline" size="sm" asChild className="ml-auto flex-shrink-0">
            <Link href={`/aquariums/${reminder.aquariumId}`}>
              <Eye className="w-4 h-4 mr-2" /> View Tank
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


export default function RemindersPage() {
  const [allReminders, setAllReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const reminders: ReminderItem[] = [];
    mockAquariumsData.forEach(aquarium => {
      if (aquarium.nextWaterChangeReminder) {
        const { status, message, daysDiff } = getReminderStatus(aquarium.nextWaterChangeReminder, 'Water Change', aquarium.name);
        reminders.push({
          id: `${aquarium.id}-waterchange`,
          aquariumId: aquarium.id,
          aquariumName: aquarium.name,
          type: 'Water Change',
          dueDate: aquarium.nextWaterChangeReminder,
          status,
          message,
          daysDiff,
        });
      }
      if (aquarium.nextFeedingReminder) {
        const { status, message, daysDiff } = getReminderStatus(aquarium.nextFeedingReminder, 'Feeding', aquarium.name);
        reminders.push({
          id: `${aquarium.id}-feeding`,
          aquariumId: aquarium.id,
          aquariumName: aquarium.name,
          type: 'Feeding',
          dueDate: aquarium.nextFeedingReminder,
          status,
          message,
          daysDiff,
        });
      }
    });

    // Sort reminders: Overdue > Due Today > Due Soon (by daysDiff asc) > Upcoming (by dueDate asc)
    reminders.sort((a, b) => {
      const statusOrder = { 'Overdue': 0, 'Due Today': 1, 'Due Soon': 2, 'Upcoming': 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (a.status === 'Overdue') return a.daysDiff - b.daysDiff; // More overdue first (more negative)
      return a.dueDate.getTime() - b.dueDate.getTime(); // Sooner dates first
    });

    setAllReminders(reminders);
    setIsLoading(false);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">Upcoming Reminders</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Reminders' },
        ]}
        className="mb-4"
      />
      <Card className="mb-8 bg-primary/10 border-primary/30">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center text-primary">
            <BellRing className="w-8 h-8 mr-3" />
            Upcoming Reminders
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 pt-2">
            Stay on top of your aquarium maintenance with this overview of all scheduled reminders.
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading reminders...</div>
      ) : allReminders.length > 0 ? (
        <div className="space-y-4">
          {allReminders.map(reminder => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Reminders Found"
          description="You have no upcoming water change or feeding reminders set."
          icon={<Info className="w-10 h-10" />}
          action={(
            <Button asChild size="sm">
              <Link href="/aquariums">Manage Your Aquariums</Link>
            </Button>
          )}
        />
      )}
    </div>
  );
}
