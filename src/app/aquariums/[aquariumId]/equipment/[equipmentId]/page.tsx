import { notFound } from 'next/navigation';
import { getAquariumById, getEquipment } from '@/lib/actions/aquarium';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Edit, Calendar, Wrench, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface EquipmentDetailPageProps {
  params: {
    aquariumId: string;
    equipmentId: string;
  };
}

export default async function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
  const { aquariumId, equipmentId } = params;

  // Fetch data
  const [aquariumResult, equipmentResult] = await Promise.all([
    getAquariumById(aquariumId),
    getEquipment({ aquariumId }),
  ]);

  if (aquariumResult.error || !aquariumResult.aquarium) {
    notFound();
  }

  const equipment = equipmentResult.equipment?.find((e: any) => e.id === equipmentId);

  if (!equipment) {
    notFound();
  }

  const { aquarium } = aquariumResult;

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

  const getMaintenanceStatus = () => {
    if (!equipment.lastMaintenanceDate || !equipment.maintenanceIntervalDays) {
      return null;
    }

    const lastMaintenance = new Date(equipment.lastMaintenanceDate);
    const today = new Date();
    const daysSince = differenceInDays(today, lastMaintenance);
    const daysUntilNext = equipment.maintenanceIntervalDays - daysSince;

    if (daysUntilNext < 0) {
      return {
        status: 'overdue',
        message: `Maintenance overdue by ${Math.abs(daysUntilNext)} days`,
        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        icon: <AlertTriangle className="h-5 w-5" />,
      };
    } else if (daysUntilNext <= 7) {
      return {
        status: 'due-soon',
        message: `Maintenance due in ${daysUntilNext} days`,
        className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        icon: <AlertTriangle className="h-5 w-5" />,
      };
    }

    return {
      status: 'ok',
      message: `Next maintenance in ${daysUntilNext} days`,
      className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      icon: <Wrench className="h-5 w-5" />,
    };
  };

  const maintenanceStatus = getMaintenanceStatus();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href={`/aquariums/${aquariumId}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to {aquarium.name}
          </Link>
        </Button>
      </div>

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                {equipment.name}
              </CardTitle>
              {(equipment.brand || equipment.model) && (
                <p className="text-lg text-muted-foreground mb-3">
                  {[equipment.brand, equipment.model].filter(Boolean).join(' ')}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getTypeColor(equipment.type)}>
                  {equipment.type}
                </Badge>
                {!equipment.isActive && (
                  <Badge variant="secondary">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/aquariums/${aquariumId}/equipment/${equipmentId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Equipment
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Status Alert */}
      {maintenanceStatus && (
        <Card className={cn("mb-6 border-2", maintenanceStatus.className)}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {maintenanceStatus.icon}
              <div>
                <p className="font-semibold text-lg">{maintenanceStatus.message}</p>
                {equipment.lastMaintenanceDate && (
                  <p className="text-sm opacity-80">
                    Last maintained: {format(new Date(equipment.lastMaintenanceDate), 'MMMM dd, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase Information */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipment.brand && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Brand</p>
                <p className="font-medium">{equipment.brand}</p>
              </div>
            )}
            {equipment.model && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Model</p>
                <p className="font-medium">{equipment.model}</p>
              </div>
            )}
            {equipment.purchaseDate && (
              <div className="flex items-start">
                <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">
                    {format(new Date(equipment.purchaseDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipment.maintenanceIntervalDays && (
              <div className="flex items-start">
                <Wrench className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance Interval</p>
                  <p className="font-medium">
                    Every {equipment.maintenanceIntervalDays} days
                  </p>
                </div>
              </div>
            )}
            {equipment.lastMaintenanceDate && (
              <div className="flex items-start">
                <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Maintenance</p>
                  <p className="font-medium">
                    {format(new Date(equipment.lastMaintenanceDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {equipment.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Notes & Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {equipment.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
