/**
 * Water Test List Component
 * Displays a list of water tests with filtering and empty states
 */

'use client';

import { useState } from 'react';
import { WaterTestCard } from './water-test-card';
import { ExportWaterTests } from './export-water-tests';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Droplet, Plus, GitCompareArrows } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteWaterTest } from '@/lib/actions/water-test';
import { useToast } from '@/hooks/use-toast';
import type { WaterTest } from '@/types/aquarium';
import Link from 'next/link';

interface WaterTestListProps {
  tests: WaterTest[];
  aquariumId: string;
  showActions?: boolean;
  aquariumName?: string;
}

export function WaterTestList({ tests, aquariumId, showActions = true, aquariumName }: WaterTestListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  if (tests.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
        <Droplet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Water Tests Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start tracking your water quality by testing your aquarium water.
        </p>
        {showActions && (
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href={`/aquariums/${aquariumId}/test-manual`}>
                Manual Entry
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/analyze?aquariumId=${aquariumId}`}>
                <Plus className="h-4 w-4 mr-2" />
                AI Test
              </Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with action buttons */}
        {showActions && (
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Water Quality History ({tests.length})
            </h3>
            <div className="flex gap-2">
              {tests.length >= 2 && (
                <Button variant="outline" asChild>
                  <Link href="/water-tests/compare">
                    <GitCompareArrows className="h-4 w-4 mr-2" />
                    Compare
                  </Link>
                </Button>
              )}
              {tests.length > 0 && (
                <ExportWaterTests 
                  waterTests={tests} 
                  aquariumLookup={aquariumName ? { [aquariumId]: aquariumName } : {}}
                />
              )}
              <Button variant="outline" asChild>
                <Link href={`/analyze?aquariumId=${aquariumId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Test
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Test Cards */}
        <div className="space-y-4">
          {tests.map((test) => (
            <WaterTestCard
              key={test.id}
              test={test}
              showActions={showActions}
              onDelete={showActions ? setDeleteId : undefined}
            />
          ))}
        </div>
      </div>

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
