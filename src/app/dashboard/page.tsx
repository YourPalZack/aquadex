
'use client';

import { useState, useEffect } from 'react';
import type { Aquarium, TestResult, UserProfile } from '@/types'; 
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Lightbulb, Droplet, CalendarDays, Timer, AlertTriangle, BellRing, Eye, Info, History as HistoryIcon, ListPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUserAquariumsAction } from '@/lib/actions/aquarium-supabase';
import { getUserWaterTestsAction } from '@/lib/actions/water-test-supabase';
import { format, differenceInDays, isPast, isToday, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const ReminderStatus: React.FC<{ reminderDate?: Date; type: 'Water Change' | 'Feeding'; className?: string }> = ({ reminderDate, type, className }) => {
  if (!reminderDate) return null;

  const today = new Date(); today.setHours(0,0,0,0);
  const reminder = new Date(reminderDate); reminder.setHours(0,0,0,0);
  
  let text = '';
  let icon: React.ReactNode = type === 'Water Change' ? <CalendarDays className="w-4 h-4 mr-1" /> : <Timer className="w-4 h-4 mr-1" />;
  let baseClassName = 'text-xs px-2 py-1 rounded-md flex items-center ';
  let specificClassName = 'bg-muted/50 border border-border text-muted-foreground';

  if (isPast(reminder) && !isToday(reminder)) {
    const daysOverdue = differenceInDays(today, reminder);
    text = `${type} Overdue (${daysOverdue}d)`;
    icon = <AlertTriangle className="w-4 h-4 mr-1" />;
    specificClassName = 'text-destructive bg-destructive/10 border border-destructive/30 font-semibold';
  } else if (isToday(reminder)) {
    text = `${type} Due Today!`;
    icon = <BellRing className="w-4 h-4 mr-1 text-amber-600 dark:text-amber-500" />;
    specificClassName = 'text-amber-600 dark:text-amber-500 bg-amber-500/10 border border-amber-500/30 font-semibold';
  } else if (isFuture(reminder)) {
    const daysUntil = differenceInDays(reminder, today);
     if (daysUntil <= 3) { 
        text = `${type} Due in ${daysUntil +1}d (${format(reminder, 'MMM d')})`;
        icon = <BellRing className="w-4 h-4 mr-1 text-amber-600 dark:text-amber-500" />;
        specificClassName = 'text-amber-600 dark:text-amber-500 bg-amber-500/10 border border-amber-500/30';
    } else {
        return null; 
    }
  } else {
    return null; 
  }
  
  return (
    <Badge variant="outline" className={cn(baseClassName, specificClassName, className)}>
      {icon} <span className="ml-1">{text}</span>
    </Badge>
  );
};

interface RecentTestResult extends TestResult {
  aquariumName?: string;
}

function DashboardContent() {
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch aquariums
        const aquariumsResult = await getUserAquariumsAction();
        if (aquariumsResult.success && aquariumsResult.data) {
          // Transform database aquariums to match Aquarium type
          const transformedAquariums: Aquarium[] = aquariumsResult.data.map((aq: any) => ({
            id: aq.id,
            name: aq.name,
            type: aq.type,
            volumeGallons: aq.size_gallons,
            volumeLiters: aq.size_liters,
            setupDate: aq.setup_date,
            userId: aq.user_id,
            equipment: aq.equipment || {},
            livestock: aq.livestock || [],
            plants: aq.plants || [],
            substrate: aq.substrate,
            filtration: aq.filtration,
            lighting: aq.lighting,
            heater: aq.heater,
            notes: aq.notes,
            photoUrl: aq.photo_url,
            nextWaterChangeReminder: aq.next_water_change ? new Date(aq.next_water_change) : undefined,
            nextFeedingReminder: aq.next_feeding_reminder ? new Date(aq.next_feeding_reminder) : undefined,
            isActive: aq.is_active,
          }));
          setAquariums(transformedAquariums);
        }

        // Fetch recent water tests
        const testsResult = await getUserWaterTestsAction(5);
        if (testsResult.success && testsResult.data) {
          const transformedTests: RecentTestResult[] = testsResult.data.map((test: any) => {
            const aquarium = aquariumsResult.data?.find((aq: any) => aq.id === test.aquarium_id);
            return {
              id: test.id,
              aquariumId: test.aquarium_id,
              aquariumName: aquarium?.name || 'Unknown Tank',
              userId: test.user_id,
              timestamp: test.test_date,
              parameters: `pH: ${test.ph || 'N/A'}, Temp: ${test.temperature || 'N/A'}°F, Ammonia: ${test.ammonia || 'N/A'}ppm`,
              ph: test.ph,
              temperature: test.temperature,
              ammonia: test.ammonia,
              nitrite: test.nitrite,
              nitrate: test.nitrate,
              hardness: test.gh,
              alkalinity: test.kh,
              notes: test.notes,
            };
          });
          setRecentTests(transformedTests);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user, toast]);

  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="space-y-8">
        <Card className="bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-primary flex items-center">
              <Lightbulb className="w-8 h-8 mr-3 text-primary" />
              Welcome to Your AquaDex Dashboard!
            </CardTitle>
            <CardDescription className="text-base text-foreground/80">
              Manage your aquariums, track test history, and get reminders.
              Need to analyze a new test strip? Go to the <Link href="/analyze" className="text-primary hover:underline">Water Test page</Link>.
            </CardDescription>
          </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground">
                For tips on accurate test strip analysis, visit our <Link href="/analyze" className="text-primary hover:underline">Water Test page</Link>.
             </p>
           </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center">
                <Droplet className="w-6 h-6 mr-3 text-primary" />
                Aquarium Overview & Reminders
            </CardTitle>
            <CardDescription>
                Quick glance at your tanks and any upcoming maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent className={aquariums.length > 0 ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : ""}>
            {aquariums.length > 0 ? (
              aquariums.map(aquarium => (
                <Card key={aquarium.id} className="p-4 bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                      <div>
                        <Link href={`/aquariums/${aquarium.id}`} className="hover:underline">
                          <h3 className="text-lg font-semibold text-primary">{aquarium.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground capitalize">
                          {aquarium.type} - {aquarium.volumeGallons ? `${aquarium.volumeGallons} Gallons` : 'Volume N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <ReminderStatus reminderDate={aquarium.nextWaterChangeReminder} type="Water Change" />
                      <ReminderStatus reminderDate={aquarium.nextFeedingReminder} type="Feeding" />
                    </div>
                  </div>
                  <div className="mt-auto pt-3 border-t border-border/50">
                    <Link href={`/aquariums/${aquarium.id}`} passHref>
                        <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" /> View Details
                        </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-6">
                <Info className="w-10 h-10 mx-auto mb-2 opacity-70" />
                <p>No aquariums added yet.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/aquariums">Add Your First Aquarium</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center">
              <HistoryIcon className="w-6 h-6 mr-3 text-primary" />
              Recent Test History
            </CardTitle>
            <CardDescription>
              A quick look at your last five water tests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTests.length > 0 ? (
              <ul className="space-y-3">
                {recentTests.map((test, index) => (
                  <li key={test.id}>
                    <div className="p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-foreground/90">
                                {format(new Date(test.timestamp), 'MMM d, yyyy - p')}
                            </span>
                            <Badge variant="secondary" className="text-xs">{test.aquariumName}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                            Parameters: {truncateText(test.parameters, 60)}
                        </p>
                        <Link href={`/history#${test.id}`} passHref>
                            <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary hover:underline">
                                View Full Details <Eye className="w-3 h-3 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    {index < recentTests.length - 1 && <Separator className="my-3" />}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                <Info className="w-10 h-10 mx-auto mb-2 opacity-70" />
                <p>No recent test results found.</p>
                <Button variant="link" asChild className="mt-1">
                    <Link href="/analyze">Analyze your first test strip</Link>
                </Button>
              </div>
            )}
          </CardContent>
          {recentTests.length > 0 && (
             <CardFooter>
                <Link href="/history" passHref>
                    <Button variant="outline" size="sm" className="w-full">
                        View All Test History
                    </Button>
                </Link>
             </CardFooter>
          )}
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Explore more features to manage your aquarium.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/analyze" passHref>
                     <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                        <div className="flex flex-col">
                            <span className="font-semibold">Analyze Water Test</span>
                            <span className="text-xs text-muted-foreground">Upload a new test strip.</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/history" passHref>
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                        <div className="flex flex-col">
                            <span className="font-semibold">View Test History</span>
                            <span className="text-xs text-muted-foreground">Track your parameters over time.</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/aquariums" passHref>
                     <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                        <div className="flex flex-col">
                            <span className="font-semibold">Manage Aquariums</span>
                            <span className="text-xs text-muted-foreground">Log water changes and tank details.</span>
                        </div>
                    </Button>
                </Link>
                 <Link href="/qa" passHref>
                     <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                        <div className="flex flex-col">
                            <span className="font-semibold">Community Q&A</span>
                            <span className="text-xs text-muted-foreground">Ask questions and share advice.</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/marketplace/add-listing" passHref>
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                        <div className="flex flex-col">
                            <span className="font-semibold">Create New Listing</span>
                            <span className="text-xs text-muted-foreground">Sell items on the marketplace.</span>
                        </div>
                        <ListPlus className="w-4 h-4 ml-auto" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
