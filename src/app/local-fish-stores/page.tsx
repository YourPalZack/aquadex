
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { LocalFishStore } from '@/types';
import { mockLocalFishStoresData } from '@/types'; // Updated import
import LocalFishStoreCard from '@/components/local-fish-stores/LocalFishStoreCard';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, Search, MapPin, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock Data for Local Fish Stores moved to src/types/index.ts

export default function LocalFishStoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState<LocalFishStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setStores(mockLocalFishStoresData);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredStores = useMemo(() => {
    if (!searchTerm) return stores;
    return stores.filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.zipCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.services && store.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [stores, searchTerm]);

  const handleUseLocation = () => {
    // Mock geolocation feature
    toast({
      title: "Using Location (Mocked)",
      description: "In a real app, we'd use your browser's location to find nearby stores. For now, showing all stores.",
    });
    // In a real app, you would call navigator.geolocation.getCurrentPosition and then filter stores.
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center text-primary">
            <Store className="w-8 h-8 mr-3" />
            Local Fish Stores
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 pt-2">
            Find aquarium stores in your area. Search by name, city, zip, or services offered.
          </CardDescription>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stores by name, city, zip, or service..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleUseLocation} variant="outline" className="w-full sm:w-auto">
              <MapPin className="w-4 h-4 mr-2" /> Use My Location
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Loading stores...</p>
        </div>
      ) : filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <LocalFishStoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-10">
            <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-xl font-semibold mb-2">No Stores Found</p>
            <p>
              {searchTerm
                ? `No stores match your search criteria "${searchTerm}".`
                : "There are currently no fish stores listed."
              }
            </p>
          </CardContent>
        </Card>
      )}
       <Alert variant="default" className="mt-8 bg-muted/50 border-border">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-muted-foreground font-semibold">Please Note</AlertTitle>
        <AlertDescription className="text-muted-foreground/80">
          Store listings are for informational purposes. Hours and services may vary. Please contact stores directly to confirm details.
          The "Use My Location" feature is currently mocked for demonstration.
        </AlertDescription>
      </Alert>
    </div>
  );
}

    