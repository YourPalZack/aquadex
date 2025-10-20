'use client';

import { useState } from 'react';
import { ExportWaterTests } from './export-water-tests';
import { WaterTestCard } from './water-test-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Droplet, Filter, Plus, Calendar, GitCompareArrows } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteWaterTest } from '@/lib/actions/water-test';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { WaterTest, Aquarium } from '@/types/aquarium';
import Link from 'next/link';

interface WaterTestsPageContentProps {
  waterTests: WaterTest[];
  aquariums: Aquarium[];
  aquariumLookup: Record<string, string>;
}

export function WaterTestsPageContent({ 
  waterTests, 
  aquariums, 
  aquariumLookup 
}: WaterTestsPageContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedAquarium, setSelectedAquarium] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter tests by selected aquarium
  const filteredTests = selectedAquarium === 'all' 
    ? waterTests 
    : waterTests.filter(test => test.aquariumId === selectedAquarium);

  // Sort tests by date (newest first)
  const sortedTests = filteredTests.sort((a, b) => 
    new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteWaterTest(deleteId);
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Water test deleted successfully',
        });
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete water test',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (waterTests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Droplet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Water Tests Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start tracking your water quality by testing your aquarium water. You can analyze test strips with AI or enter results manually.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/analyze">
                Manual Entry
              </Link>
            </Button>
            <Button asChild>
              <Link href="/analyze">
                <Plus className="h-4 w-4 mr-2" />
                AI Analysis
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Droplet className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{waterTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {waterTests.filter(test => {
                    const testDate = new Date(test.testDate);
                    const now = new Date();
                    return testDate.getMonth() === now.getMonth() && 
                           testDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Aquariums</p>
                <p className="text-2xl font-bold">{aquariums.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Test History ({filteredTests.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedAquarium} onValueChange={setSelectedAquarium}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Filter by aquarium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Aquariums</SelectItem>
                  {aquariums.map((aquarium) => (
                    <SelectItem key={aquarium.id} value={aquarium.id}>
                      {aquarium.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {filteredTests.length >= 2 && (
                <Button variant="outline" asChild>
                  <Link href="/water-tests/compare">
                    <GitCompareArrows className="h-4 w-4 mr-2" />
                    Compare Tests
                  </Link>
                </Button>
              )}
              
              {filteredTests.length > 0 && (
                <ExportWaterTests 
                  waterTests={filteredTests} 
                  aquariumLookup={aquariumLookup}
                />
              )}
              
              <Button asChild>
                <Link href="/analyze">
                  <Plus className="h-4 w-4 mr-2" />
                  New Test
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {filteredTests.length === 0 ? (
          <CardContent className="py-8 text-center text-muted-foreground">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            {selectedAquarium === 'all' 
              ? 'No water tests found' 
              : `No water tests found for ${aquariumLookup[selectedAquarium] || 'this aquarium'}`
            }
          </CardContent>
        ) : (
          <CardContent className="space-y-4">
            {/* Group tests by aquarium when showing all */}
            {selectedAquarium === 'all' ? (
              <>
                {aquariums.map(aquarium => {
                  const aquariumTests = sortedTests.filter(test => test.aquariumId === aquarium.id);
                  if (aquariumTests.length === 0) return null;
                  
                  return (
                    <div key={aquarium.id} className="space-y-4">
                      <div className="flex items-center gap-3 pt-6 first:pt-0">
                        <h4 className="text-lg font-semibold">{aquarium.name}</h4>
                        <Badge variant="outline">{aquariumTests.length} tests</Badge>
                      </div>
                      <div className="space-y-3">
                        {aquariumTests.map((test) => (
                          <WaterTestCard
                            key={test.id}
                            test={test}
                            showActions={true}
                            onDelete={setDeleteId}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              /* Show filtered tests */
              <div className="space-y-3">
                {sortedTests.map((test) => (
                  <WaterTestCard
                    key={test.id}
                    test={test}
                    showActions={true}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Water Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this water test? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}