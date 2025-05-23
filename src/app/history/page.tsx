
'use client';

import { useState, useEffect } from 'react';
import type { TestResult } from '@/types';
import HistoryTable from '@/components/history/HistoryTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, Trash2 } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

const mockTestResults: TestResult[] = [
  {
    id: 'tr1',
    userId: 'user123',
    timestamp: new Date('2024-07-20T10:00:00Z'),
    parameters: 'pH: 7.2, Ammonia: 0 ppm, Nitrite: 0 ppm, Nitrate: 10 ppm, GH: 6 dGH, KH: 4 dKH',
    recommendations: {
      products: ['Seachem Prime', 'API Stress Coat+'],
      reasoning: 'Overall good parameters. Prime for general conditioning and Stress Coat for fish health.',
    },
    notes: 'Routine check for the community tank.',
    imageUrl: 'https://placehold.co/300x200.png?text=Test+Strip+1',
  },
  {
    id: 'tr2',
    userId: 'user123',
    timestamp: new Date('2024-07-15T18:30:00Z'),
    parameters: 'pH: 6.8, Ammonia: 0.25 ppm, Nitrite: 0 ppm, Nitrate: 5 ppm',
    recommendations: {
      products: ['Seachem Stability', 'FritzZyme 7'],
      reasoning: 'Slight ammonia detected, recommend beneficial bacteria to boost cycle.',
    },
    notes: 'New fish added, monitoring cycle.',
  },
  {
    id: 'tr3',
    userId: 'user123',
    timestamp: new Date('2024-07-10T09:15:00Z'),
    parameters: 'pH: 7.0, Ammonia: 0 ppm, Nitrite: 0 ppm, Nitrate: 20 ppm, Chlorine: 0.02 ppm',
    recommendations: {
        products: ['Seachem Safe', 'AquaClear Filter Media'],
        reasoning: 'Trace chlorine detected, use dechlorinator. Ensure filter media is clean.'
    },
    imageUrl: 'https://placehold.co/300x200.png?text=Test+Strip+3',
  },
    {
    id: 'tr4',
    userId: 'user123',
    timestamp: new Date('2024-06-25T12:00:00Z'),
    parameters: 'pH: 7.5, Ammonia: 0 ppm, Nitrite: 0.1 ppm, Nitrate: 40 ppm, GH: 8 dGH, KH: 5 dKH',
    recommendations: {
      products: ['Seachem Prime', 'Partial Water Change'],
      reasoning: 'Nitrite slightly elevated and nitrates are high. Perform a 25% water change and use Prime.',
    },
    notes: 'Pre-vacation check.',
  },
];

export default function HistoryPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [resultToDelete, setResultToDelete] = useState<TestResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
    setTestResults(mockTestResults);
  }, []);

  const handleViewDetails = (resultId: string) => {
    // Placeholder for viewing full details, e.g., in a modal or new page
    const result = testResults.find(r => r.id === resultId);
    toast({
      title: 'View Details',
      description: `Showing details for test on ${result ? new Date(result.timestamp).toLocaleDateString() : ''}. (Feature coming soon!)`,
    });
  };
  
  const openDeleteConfirm = (result: TestResult) => {
    setResultToDelete(result);
  };

  const handleDeleteResult = () => {
    if (!resultToDelete) return;
    
    // Simulate API call for deletion
    setTestResults(prevResults => prevResults.filter(r => r.id !== resultToDelete.id));
    toast({
      title: 'Test Result Deleted',
      description: `The test result from ${new Date(resultToDelete.timestamp).toLocaleDateString()} has been removed.`,
      variant: 'destructive'
    });
    setResultToDelete(null); // Close dialog
  };

  const shareTestResultText = (result: TestResult): string => {
    let text = `AquaStrip Test Result - ${new Date(result.timestamp).toLocaleString()}:\nParameters: ${result.parameters}`;
    if (result.recommendations && result.recommendations.products.length > 0) {
      text += `\nRecommendations: ${result.recommendations.products.join(', ')}`;
    }
    if (result.notes) {
      text += `\nNotes: ${result.notes}`;
    }
    return text;
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 bg-accent/20 border-accent/30">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center text-accent">
            <BookText className="w-8 h-8 mr-3" />
            Test Result History
          </CardTitle>
          <CardDescription className="text-base text-foreground/80">
            Review your past water test analyses, track trends, and manage your records.
          </CardDescription>
        </CardHeader>
      </Card>

      {testResults.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <HistoryTable 
              testResults={testResults} 
              onViewDetails={handleViewDetails} 
              onDeleteConfirm={openDeleteConfirm}
              getShareText={shareTestResultText}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-10">
              <BookText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">No Test History Found</p>
              <p>Your past test results will appear here once you analyze a test strip.</p>
              <Button variant="link" className="mt-4" asChild>
                <a href="/analyze">Analyze a New Strip</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {resultToDelete && (
        <AlertDialog open={!!resultToDelete} onOpenChange={(open) => !open && setResultToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this test result?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the test result recorded on {' '}
                {new Date(resultToDelete.timestamp).toLocaleString()}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setResultToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteResult} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
