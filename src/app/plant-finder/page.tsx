
'use client';

import { useState } from 'react';
import PlantFinderForm from '@/components/plant-finder/PlantFinderForm';
import PlantListingCard from '@/components/plant-finder/PlantListingCard';
import type { PlantListing } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Leaf, Search, Info, BellPlus } from 'lucide-react';
import type { FindPlantActionState } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';

export default function PlantFinderPage() {
  const [searchResults, setSearchResults] = useState<PlantListing[] | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearchComplete = (result: FindPlantActionState) => {
    setSearchResults(result.searchResults);
    setAiMessage(result.aiMessage);
    setIsLoading(false);
    if (result.errors) {
        toast({
            title: "Search Error",
            description: result.message || "Could not complete plant search.",
            variant: "destructive"
        });
    }
  };

  const handleSetAlert = () => {
    toast({
      title: "Alert Feature Coming Soon!",
      description: "The ability to set up daily alerts for this plant species is not yet implemented.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">Aquatic Plant Finder</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Plant Finder' },
        ]}
        className="mb-4"
      />
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <Leaf className="w-8 h-8 mr-3" />
                Aquatic Plant Finder
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Looking for a specific aquatic plant? Enter its name below and our AI will try to find listings from various online sources.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mb-8">
        <PlantFinderForm onSearchComplete={handleSearchComplete} />
      </div>

      {aiMessage && (
        <Alert variant="default" className="mb-6 bg-accent/20 border-accent/50">
            <Info className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent/90">AI Search Summary</AlertTitle>
            <AlertDescription className="text-accent-foreground/80">
            {aiMessage}
            {searchResults && searchResults.length === 0 && aiMessage.toLowerCase().includes("alert") && (
                <Button onClick={handleSetAlert} variant="outline" size="sm" className="mt-3">
                    <BellPlus className="w-4 h-4 mr-2" /> Set Alert (Coming Soon)
                </Button>
            )}
            </AlertDescription>
        </Alert>
      )}

      {searchResults && searchResults.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Search className="w-6 h-6 mr-2 text-primary" />
            Search Results for Plants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((listing) => (
              <PlantListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {searchResults === null && !isLoading && !aiMessage && (
        <EmptyState
          title="Start Your Search"
          description="Enter a plant species name above to find listings."
          icon={<Search className="w-10 h-10" />}
        />
      )}
    </div>
  );
}
