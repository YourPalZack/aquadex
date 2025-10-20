'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { deleteEquipment } from '@/lib/actions/aquarium';
import type { Equipment } from '@/types/aquarium';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Package, Trash2, Edit, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EquipmentListProps {
  equipment: Equipment[];
  aquariumId: string;
  showActions?: boolean;
}

export function EquipmentList({ equipment, aquariumId, showActions = true }: EquipmentListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteEquipment(id);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Equipment removed successfully',
      });
      router.refresh();
    }
    setDeletingId(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'filter':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'heater':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'light':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'pump':
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400';
      case 'skimmer':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getMaintenanceStatus = (item: Equipment) => {
    if (!item.lastMaintenanceDate || !item.maintenanceIntervalDays) {
      return null;
    }

    const lastMaintenance = new Date(item.lastMaintenanceDate);
    const today = new Date();
    const daysSince = differenceInDays(today, lastMaintenance);
    const daysUntilNext = item.maintenanceIntervalDays - daysSince;

    if (daysUntilNext < 0) {
      return {
        status: 'overdue',
        message: `Overdue by ${Math.abs(daysUntilNext)} days`,
        className: 'bg-red-500/10 text-red-700 dark:text-red-400',
      };
    } else if (daysUntilNext <= 7) {
      return {
        status: 'due-soon',
        message: `Due in ${daysUntilNext} days`,
        className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      };
    }

    return {
      status: 'ok',
      message: `Due in ${daysUntilNext} days`,
      className: 'bg-green-500/10 text-green-700 dark:text-green-400',
    };
  };

  if (!equipment || equipment.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-xl font-semibold mb-2">No equipment yet</h3>
          <p className="text-muted-foreground mb-6 text-center">
            Start adding filters, heaters, lights, and other equipment to track maintenance
          </p>
          {showActions && (
            <Button asChild>
              <Link href={`/aquariums/${aquariumId}/equipment/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Equipment ({equipment.length})</h3>
            <p className="text-sm text-muted-foreground">
              Track and maintain your aquarium equipment
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={`/aquariums/${aquariumId}/equipment/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Link>
          </Button>
        </div>
      )}

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipment.map((item) => {
          const maintenanceStatus = getMaintenanceStatus(item);
          
          return (
            <Card key={item.id} className={!item.isActive ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {item.name}
                      {!item.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                      {maintenanceStatus?.status === 'overdue' && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </CardTitle>
                    {(item.brand || item.model) && (
                      <CardDescription className="text-sm mt-1">
                        {[item.brand, item.model].filter(Boolean).join(' ')}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Type Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getTypeColor(item.type)}>
                    {item.type}
                  </Badge>
                  {item.maintenanceIntervalDays && (
                    <Badge variant="outline">
                      Every {item.maintenanceIntervalDays} days
                    </Badge>
                  )}
                </div>

                {/* Maintenance Status */}
                {maintenanceStatus && (
                  <div className={cn(
                    "p-2 rounded-md text-sm font-medium",
                    maintenanceStatus.className
                  )}>
                    Maintenance: {maintenanceStatus.message}
                  </div>
                )}

                {/* Purchase Date */}
                {item.purchaseDate && (
                  <p className="text-xs text-muted-foreground">
                    Purchased {format(new Date(item.purchaseDate), 'MMM dd, yyyy')}
                  </p>
                )}

                {/* Last Maintenance */}
                {item.lastMaintenanceDate && (
                  <p className="text-xs text-muted-foreground">
                    Last maintained {format(new Date(item.lastMaintenanceDate), 'MMM dd, yyyy')}
                  </p>
                )}

                {/* Notes Preview */}
                {item.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.notes}
                  </p>
                )}

                {/* Actions */}
                {showActions && (
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/aquariums/${aquariumId}/equipment/${item.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                    >
                      <Link href={`/aquariums/${aquariumId}/equipment/${item.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deletingId === item.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Equipment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {item.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
