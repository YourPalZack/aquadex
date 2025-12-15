
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format, differenceInDays, isFuture, isPast, isToday } from 'date-fns';
import type { Aquarium, TestResult, SourceWaterType } from '@/types';
import { mockAquariumsData } from '@/types'; 
import { mockTestResults }  from '@/types'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import HistoryTable from '@/components/history/HistoryTable'; 
import {
  ArrowLeft, Droplet, CalendarDays, Users, Leaf, Filter, Info, Utensils, Timer, Edit3, AlertTriangle, BellRing, FishSymbol, Activity, Trash2, PackageSearch, Pipette
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const DetailItem: React.FC<{ icon: React.ReactNode; label?: string; value?: React.ReactNode; children?: React.ReactNode; className?: string }> = ({ icon, label, value, children, className }) => (
  <div className={cn("flex items-start text-sm", className)}>
    <div className="flex-shrink-0 w-5 h-5 mr-3 text-muted-foreground">{icon}</div>
    <div className="flex-grow">
      {label && <span className="font-medium text-foreground/90">{label}: </span>}
      {value && <span className="text-foreground/80">{value}</span>}
      {children}
    </div>
  </div>
);

const ReminderStatus: React.FC<{ reminderDate?: Date; type: 'Water Change' | 'Feeding' }> = ({ reminderDate, type }) => {
  if (!reminderDate) return null;

  const today = new Date(); today.setHours(0,0,0,0);
  const reminder = new Date(reminderDate); reminder.setHours(0,0,0,0);
  
  let text = '';
  let icon: React.ReactNode = type === 'Water Change' ? <CalendarDays className="w-4 h-4 mr-1" /> : <Timer className="w-4 h-4 mr-1" />;
  let baseClassName = 'text-sm p-3 rounded-md flex items-center my-2 ';
  let specificClassName = 'bg-muted/50 border border-border text-muted-foreground';

  if (isPast(reminder) && !isToday(reminder)) {
    const daysOverdue = differenceInDays(today, reminder);
    text = `${type} Overdue by ${daysOverdue} day(s) (was ${format(reminder, 'MMM d')})`;
    icon = <AlertTriangle className="w-4 h-4 mr-1" />;
    specificClassName = 'text-destructive bg-destructive/10 border border-destructive/30 font-semibold';
  } else if (isToday(reminder)) {
    text = `${type} Due Today!`;
    icon = <BellRing className="w-4 h-4 mr-1" />;
    specificClassName = 'text-amber-600 dark:text-amber-500 bg-amber-500/10 border border-amber-500/30 font-semibold';
  } else if (isFuture(reminder)) {
    const daysUntil = differenceInDays(reminder, today);
     if (daysUntil <= 3) {
        text = `${type} Due in ${daysUntil +1} day(s) (${format(reminder, 'MMM d')})`;
        icon = <BellRing className="w-4 h-4 mr-1" />;
        specificClassName = 'text-amber-600 dark:text-amber-500 bg-amber-500/10 border border-amber-500/30';
    } else {
        text = `Next ${type}: ${format(reminder, 'MMM d, yyyy')}`;
    }
  }
  
  return (
    <div className={cn(baseClassName, specificClassName)}>
      {icon} <span className="ml-1">{text}</span>
    </div>
  );
};


export default function AquariumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const aquariumId = params.aquariumId as string;

  const [aquarium, setAquarium] = useState<Aquarium | null>(null);
  const [relatedTests, setRelatedTests] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (aquariumId) {
      setIsLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        const foundAquarium = mockAquariumsData.find(aq => aq.id === aquariumId);
        if (foundAquarium) {
          setAquarium(foundAquarium);
          const tests = mockTestResults.filter(test => test.aquariumId === aquariumId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRelatedTests(tests);
        } else {
          toast({ title: 'Error', description: 'Aquarium not found.', variant: 'destructive' });
          router.push('/aquariums');
        }
        setIsLoading(false);
      }, 300);
    }
  }, [aquariumId, router, toast]);

  const handleViewTestDetails = (resultId: string) => {
    toast({ title: 'Info', description: `Viewing details for test ID: ${resultId} (Feature not fully implemented on this page)`});
  };
  const [testToDelete, setTestToDelete] = useState<TestResult | null>(null);
  const openDeleteTestConfirm = (result: TestResult) => {
    setTestToDelete(result);
  };
  const handleDeleteTestResult = () => {
     if (!testToDelete || !aquarium) return;
     setRelatedTests(prev => prev.filter(r => r.id !== testToDelete!.id));
     toast({title: 'Test Deleted', description: 'Test result removed from this view.', variant: 'destructive'});
     setTestToDelete(null);
  };

  const getShareTestText = (result: TestResult): string => {
    return `AquaStrip Test from ${aquarium?.name || 'My Aquarium'} - ${new Date(result.timestamp).toLocaleString()}:\nParameters: ${result.parameters}`;
  };

  const getSourceWaterTypeDisplay = (type?: SourceWaterType) => {
    if (!type) return 'Not specified';
    switch (type) {
      case 'ro': return 'R/O Water';
      case 'premixed_saltwater': return 'Pre-mixed Saltwater';
      case 'tap': return 'Tap Water';
      default: return 'Not specified';
    }
  };


  if (isLoading) {
    return <div className="container mx-auto py-8 text-center text-lg font-semibold">Loading aquarium details...</div>;
  }

  if (!aquarium) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader><CardTitle>Aquarium Not Found</CardTitle></CardHeader>
          <CardContent>
            <PackageSearch className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p>The aquarium you are looking for does not exist or could not be loaded.</p>
            <Button variant="link" asChild className="mt-4">
              <Link href="/aquariums"><ArrowLeft className="mr-2 h-4 w-4" />Back to My Aquariums</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <Button variant="outline" onClick={() => router.push('/aquariums')} className="mb-6 shadow-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Aquariums
        </Button>
      </div>

      <Card className="overflow-hidden shadow-xl border-primary/20">
        {aquarium.imageUrl && (
          <div className="relative w-full h-64 md:h-80 bg-muted border-b">
            <Image src={aquarium.imageUrl} alt={`Image of ${aquarium.name}`} layout="fill" objectFit="cover" data-ai-hint="aquarium fish tank" />
          </div>
        )}
        <CardHeader className="border-b bg-card">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div>
                <CardTitle className="text-3xl lg:text-4xl flex items-center text-primary">
                <Droplet className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
                {aquarium.name}
                </CardTitle>
                <CardDescription className="text-base mt-2 ml-1 flex items-center gap-2">
                    <Badge variant={aquarium.type === 'freshwater' ? 'secondary' : aquarium.type === 'saltwater' ? 'default' : 'outline' } className="capitalize text-sm px-3 py-1">
                        {aquarium.type}
                    </Badge>
                    {aquarium.volumeGallons && 
                        <Badge variant="outline" className="text-sm px-3 py-1">{aquarium.volumeGallons} Gallons</Badge>
                    }
                </CardDescription>
            </div>
            <Button variant="outline" size="default" onClick={() => router.push(`/aquariums?edit=${aquarium.id}`)} className="mt-2 sm:mt-0 flex-shrink-0 shadow-sm hover:bg-accent/50">
              <Edit3 className="w-4 h-4 mr-2" /> Edit Aquarium
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 grid md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-4 p-4 border rounded-lg bg-background shadow-sm">
                <CardTitle className="text-xl mb-4 border-b pb-3 text-foreground/90">Tank Setup</CardTitle>
                {aquarium.fishSpecies && <DetailItem icon={<FishSymbol />} label="Fish Species" value={aquarium.fishSpecies} />}
                {aquarium.fishCount !== undefined && <DetailItem icon={<Users />} label="Fish Count" value={aquarium.fishCount.toString()} />}
                {typeof aquarium.co2Injection === 'boolean' && <DetailItem icon={<Leaf />} label="CO2 Injection" value={aquarium.co2Injection ? 'Yes' : 'No'} />}
                {aquarium.filterDetails && <DetailItem icon={<Filter />} label="Filter Details" value={aquarium.filterDetails} />}
                {aquarium.foodDetails && <DetailItem icon={<Utensils />} label="Food Details" value={aquarium.foodDetails} />}
                {aquarium.sourceWaterType && (
                  <DetailItem icon={<Pipette />} label="Source Water" value={getSourceWaterTypeDisplay(aquarium.sourceWaterType)}>
                    {aquarium.sourceWaterParameters && (
                      <p className="text-foreground/80 whitespace-pre-wrap bg-muted/50 p-2 rounded-md mt-1 border text-xs">{aquarium.sourceWaterParameters}</p>
                    )}
                  </DetailItem>
                )}
            </div>

            <div className="space-y-1 p-4 border rounded-lg bg-background shadow-sm">
                 <CardTitle className="text-xl mb-4 border-b pb-3 text-foreground/90">Maintenance & Notes</CardTitle>
                {aquarium.lastWaterChange && (
                    <DetailItem icon={<CalendarDays />} label="Last Water Change" value={format(new Date(aquarium.lastWaterChange), 'PPP')} />
                )}
                <div className="space-y-3 pt-2">
                  <ReminderStatus reminderDate={aquarium.nextWaterChangeReminder} type="Water Change" />
                  <ReminderStatus reminderDate={aquarium.nextFeedingReminder} type="Feeding" />
                </div>
                
                {aquarium.notes && (
                  <div className="pt-3">
                    <DetailItem icon={<Info />} label="Notes">
                        <p className="text-foreground/80 whitespace-pre-wrap bg-muted/50 p-3 rounded-md mt-1 border">{aquarium.notes}</p>
                    </DetailItem>
                  </div>
                )}
                 {!aquarium.notes && <p className="text-sm text-muted-foreground pl-8 pt-2">No notes added for this aquarium.</p>}
            </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-accent/30">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Activity className="w-7 h-7 mr-3 text-accent" />
            Past Test Results for {aquarium.name}
          </CardTitle>
          <CardDescription>
            Review historical water parameters for this aquarium.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {relatedTests.length > 0 ? (
            <HistoryTable
              testResults={relatedTests}
              onViewDetails={handleViewTestDetails}
              onDeleteConfirm={openDeleteTestConfirm}
              getShareText={getShareTestText}
            />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
              No test results found for this aquarium yet.
            </div>
          )}
        </CardContent>
      </Card>

      {testToDelete && (
        <AlertDialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete This Test Result?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The test result from {' '}
                {new Date(testToDelete.timestamp).toLocaleString()} will be removed from this view.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTestToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTestResult} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Test
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
  );
}

