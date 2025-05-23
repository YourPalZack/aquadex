
'use client';

import { useState } from 'react';
import TankFinderForm from '@/components/tank-finder/TankFinderForm';
import TankListingCard from '@/components/tank-finder/TankListingCard';
import type { TankListing } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Archive, Search, Info, BellPlus } from 'lucide-react';
import type { FindTankActionState } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function TankFinderPage() {
  const [searchResults, setSearchResults] = useState<TankListing[] | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Form status will handle its own loading
  const { toast } = useToast();

  const handleSearchComplete = (result: FindTankActionState) => {
    setSearchResults(result.searchResults);
    setAiMessage(result.aiMessage);
    // setIsLoading(false); // Form status handles its own loading indicator
    if (result.errors || result.message?.startsWith('Search failed:') || result.message?.startsWith('Validation failed:')) {
        toast({
            title: "Search Information",
            description: result.message || "Could not complete tank search.",
            variant: result.errors ? "destructive" : "default"
        });
    }
  };

  const handleSetAlert = () => {
    toast({
      title: "Alert Feature Coming Soon!",
      description: "The ability to set up daily alerts for this tank search is not yet implemented.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <Archive className="w-8 h-8 mr-3" />
                Tank Finder
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Looking for a specific aquarium tank? Enter its specifications below and our AI will try to find listings from various online sources.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mb-8">
        <TankFinderForm onSearchComplete={handleSearchComplete} />
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
            Search Results for Tanks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((listing) => (
              <TankListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {searchResults === null && !isLoading && !aiMessage && (
         <Card className="mt-8">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter tank specifications above to start your search.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
