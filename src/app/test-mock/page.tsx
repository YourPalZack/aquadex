import { getAquariums, getAquariumById } from '@/lib/actions-example';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fish, Droplet, Thermometer, Calendar } from 'lucide-react';
import Image from 'next/image';

export default async function TestMockPage() {
  const { aquariums } = await getAquariums();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mock Data Test Page</h1>
        <p className="text-muted-foreground">
          This page demonstrates the mock data system working. All data is loaded from 
          <code className="mx-1 px-2 py-1 bg-muted rounded text-sm">src/lib/mock/data.ts</code>
          without any real database connection.
        </p>
        <Badge variant="secondary" className="mt-4">
          🎭 Mock Mode Active
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {aquariums?.map((aquarium) => (
          <Card key={aquarium.id} className="overflow-hidden">
            {aquarium.imageUrls && aquarium.imageUrls.length > 0 && (
              <div className="relative h-48 w-full">
                <Image
                  src={aquarium.imageUrls[0]}
                  alt={aquarium.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fish className="h-5 w-5 text-primary" />
                {aquarium.name}
              </CardTitle>
              <CardDescription>
                {aquarium.sizeGallons} gallons • {aquarium.waterType}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplet className="h-4 w-4" />
                <span className="capitalize">{aquarium.waterType}</span>
              </div>
              
              {aquarium.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Thermometer className="h-4 w-4" />
                  <span>{aquarium.location}</span>
                </div>
              )}
              
              {aquarium.setupDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Setup: {new Date(aquarium.setupDate).toLocaleDateString()}</span>
                </div>
              )}

              {aquarium.notes && (
                <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                  {aquarium.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!aquariums || aquariums.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No aquariums found</p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Mock Data System</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Data loaded from <code className="bg-muted px-1 rounded">src/lib/mock/data.ts</code></li>
              <li>Server actions use <code className="bg-muted px-1 rounded">getDbClient()</code> which returns mock database</li>
              <li>No real database, Supabase, or Google AI API required</li>
              <li>Perfect for UI development and testing</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Toggle to Real Services</h3>
            <p className="text-sm text-muted-foreground">
              When ready, set <code className="bg-muted px-1 rounded">USE_MOCK_DATA="false"</code> in 
              <code className="bg-muted px-1 rounded">.env.local</code> and the same code will work with real services.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Available Mock Data</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>3 aquariums (75g reef, 20g planted, 10g betta)</li>
              <li>Livestock (clownfish, coral, shrimp)</li>
              <li>Equipment (filter, light, heater)</li>
              <li>3 water tests with realistic parameters</li>
              <li>Maintenance tasks with completion history</li>
              <li>2 community questions</li>
              <li>2 marketplace listings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
