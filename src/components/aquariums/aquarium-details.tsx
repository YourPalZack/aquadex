'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Fish, 
  Droplet, 
  Calendar, 
  MapPin, 
  Edit,
  FileText,
  Activity,
  Package,
  TestTube
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Aquarium, Livestock, Equipment, WaterTest } from '@/types/aquarium';
import { format } from 'date-fns';
import { WaterTestList } from './water-test-list';
import { AdvancedWaterCharts } from './advanced-water-charts';
import { WaterTestSchedule } from './water-test-schedule';

interface AquariumDetailsProps {
  aquarium: Aquarium;
  livestock?: Livestock[];
  equipment?: Equipment[];
  waterTests?: WaterTest[];
}

export function AquariumDetails({ aquarium, livestock = [], equipment = [], waterTests = [] }: AquariumDetailsProps) {
  const waterTypeColors = {
    freshwater: 'bg-blue-500',
    saltwater: 'bg-cyan-500',
    brackish: 'bg-teal-500',
  };

  const waterTypeLabels = {
    freshwater: 'Freshwater',
    saltwater: 'Saltwater',
    brackish: 'Brackish',
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Fish className="h-6 w-6 text-primary" />
                <CardTitle className="text-3xl">{aquarium.name}</CardTitle>
              </div>
              <CardDescription>
                {aquarium.sizeGallons} gallon {waterTypeLabels[aquarium.waterType].toLowerCase()} aquarium
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={waterTypeColors[aquarium.waterType]}>
                {waterTypeLabels[aquarium.waterType]}
              </Badge>
              {!aquarium.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Images */}
        {aquarium.imageUrls && aquarium.imageUrls.length > 0 && (
          <div className="px-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aquarium.imageUrls.map((url, index) => (
                <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`${aquarium.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Size</p>
              <p className="text-2xl font-bold">{aquarium.sizeGallons}g</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Livestock</p>
              <p className="text-2xl font-bold">{livestock.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Equipment</p>
              <p className="text-2xl font-bold">{equipment.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Setup Date</p>
              <p className="text-2xl font-bold">
                {format(new Date(aquarium.setupDate), 'MMM yyyy')}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 pt-4 border-t">
            {aquarium.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span>{aquarium.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Setup Date:</span>
              <span>{format(new Date(aquarium.setupDate), 'PPP')}</span>
            </div>

            {aquarium.notes && (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="mt-1">{aquarium.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button asChild>
              <Link href={`/aquariums/${aquarium.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Aquarium
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/analyze?aquariumId=${aquarium.id}`}>
                <Activity className="h-4 w-4 mr-2" />
                Test Water (AI)
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/aquariums/${aquarium.id}/test-manual`}>
                <FileText className="h-4 w-4 mr-2" />
                Manual Entry
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Livestock, Equipment, etc. */}
      <Tabs defaultValue="livestock" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="livestock">
            <Fish className="h-4 w-4 mr-2" />
            Livestock ({livestock.length})
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Package className="h-4 w-4 mr-2" />
            Equipment ({equipment.length})
          </TabsTrigger>
          <TabsTrigger value="water-tests">
            <TestTube className="h-4 w-4 mr-2" />
            Water Tests ({waterTests.length})
          </TabsTrigger>
        </TabsList>

        {/* Livestock Tab */}
        <TabsContent value="livestock" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Livestock</CardTitle>
                  <CardDescription>Fish, corals, plants, and invertebrates</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/aquariums/${aquarium.id}/livestock/new`}>
                    Add Livestock
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {livestock.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Fish className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No livestock added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {livestock.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {item.imageUrl && (
                          <div className="relative h-12 w-12 rounded overflow-hidden">
                            <Image src={item.imageUrl} alt={item.species} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.species}</p>
                          {item.commonName && (
                            <p className="text-sm text-muted-foreground">{item.commonName}</p>
                          )}
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{item.type}</Badge>
                            <Badge variant="secondary">Qty: {item.quantity}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/aquariums/${aquarium.id}/livestock/${item.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Equipment</CardTitle>
                  <CardDescription>Filters, heaters, lights, and more</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/aquariums/${aquarium.id}/equipment/new`}>
                    Add Equipment
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {equipment.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No equipment added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {equipment.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.brand && item.model ? `${item.brand} ${item.model}` : item.brand || item.model || 'No details'}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{item.type}</Badge>
                          {item.maintenanceIntervalDays && (
                            <Badge variant="secondary">
                              Maintenance: {item.maintenanceIntervalDays}d
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/aquariums/${aquarium.id}/equipment/${item.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Water Tests Tab */}
        <TabsContent value="water-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Water Quality Tests</CardTitle>
                  <CardDescription>Track and monitor water parameters over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/aquariums/${aquarium.id}/test-manual`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Manual Entry
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/analyze?aquariumId=${aquarium.id}`}>
                      <TestTube className="h-4 w-4 mr-2" />
                      AI Test
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Water Test Schedule */}
              <WaterTestSchedule aquarium={aquarium} />
              
              {/* Advanced Water Charts */}
              {waterTests.length >= 2 && (
                <AdvancedWaterCharts tests={waterTests} aquariumType={aquarium.waterType} />
              )}
              
              {/* Water Test List */}
              <WaterTestList 
                tests={waterTests} 
                aquariumId={aquarium.id}
                aquariumName={aquarium.name}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
