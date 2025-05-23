
'use client';

import { useState, useEffect } from 'react';
import ImageUploadForm from '@/components/dashboard/ImageUploadForm';
import AnalysisResults from '@/components/dashboard/AnalysisResults';
import TreatmentRecommendations from '@/components/dashboard/TreatmentRecommendations';
import type { Aquarium, AnalyzeTestStripOutput, RecommendTreatmentProductsOutput } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Droplet, CalendarDays, Timer, AlertTriangle, BellRing, Eye, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { mockAquariumsData } from '@/app/aquariums/page'; // Import mock data
import { format, differenceInDays, isPast, isToday, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
     if (daysUntil <= 3) { // Due in 3 days or less (daysUntil is 0 for tomorrow, 1 for day after etc.)
        text = `${type} Due in ${daysUntil +1}d (${format(reminder, 'MMM d')})`;
        icon = <BellRing className="w-4 h-4 mr-1 text-amber-600 dark:text-amber-500" />;
        specificClassName = 'text-amber-600 dark:text-amber-500 bg-amber-500/10 border border-amber-500/30';
    } else {
        // Don't show if more than 3 days away for dashboard brevity
        return null; 
    }
  } else {
    return null; // Should not happen if date is valid
  }
  
  return (
    <Badge variant="outline" className={cn(baseClassName, specificClassName, className)}>
      {icon} <span className="ml-1">{text}</span>
    </Badge>
  );
};


export default function DashboardPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTestStripOutput | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendTreatmentProductsOutput | null>(null);
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);

  useEffect(() => {
    // Simulate fetching aquariums
    setAquariums(mockAquariumsData);
  }, []);

  const handleAnalysisComplete = (data: { analysis: AnalyzeTestStripOutput; recommendations: RecommendTreatmentProductsOutput | null }) => {
    setAnalysisResult(data.analysis);
    setRecommendations(data.recommendations);
  };

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="space-y-8">
        <Card className="bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-primary flex items-center">
              <Lightbulb className="w-8 h-8 mr-3 text-primary" />
              Welcome to Your Aqua-Dashboard!
            </CardTitle>
            <CardDescription className="text-base text-foreground/80">
              Ready to check your aquarium's water quality? Upload an image of your test strip below.
              For best results, ensure good lighting and a clear photo.
            </CardDescription>
          </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground">
                New to analyzing? Try our <Link href="/analyze" className="text-primary hover:underline">quick analysis page</Link> which also has tips.
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
          <CardContent className="space-y-4">
            {aquariums.length > 0 ? (
              aquariums.map(aquarium => (
                <Card key={aquarium.id} className="p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                      <Link href={`/aquariums/${aquarium.id}`} className="hover:underline">
                        <h3 className="text-lg font-semibold text-primary">{aquarium.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground capitalize">
                        {aquarium.type} - {aquarium.volumeGallons ? `${aquarium.volumeGallons} Gallons` : 'Volume N/A'}
                      </p>
                    </div>
                    <Link href={`/aquariums/${aquarium.id}`} passHref>
                        <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" /> View Details
                        </Button>
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ReminderStatus reminderDate={aquarium.nextWaterChangeReminder} type="Water Change" />
                    <ReminderStatus reminderDate={aquarium.nextFeedingReminder} type="Feeding" />
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <ImageUploadForm onAnalysisComplete={handleAnalysisComplete} />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <AnalysisResults analysis={analysisResult} />
            <TreatmentRecommendations recommendations={recommendations} />
          </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Explore more features to manage your aquarium.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
