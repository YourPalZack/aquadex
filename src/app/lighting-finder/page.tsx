
'use client';

import { useState } from 'react';
import LightingFinderForm from '@/components/lighting-finder/LightingFinderForm';
import LightingListingCard from '@/components/lighting-finder/LightingListingCard';
import type { LightingListing } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sun, Search, Info, BellPlus, Star } from 'lucide-react';
import type { FindLightingActionState } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function LightingFinderPage() {
  const [searchResults, setSearchResults] = useState<LightingListing[] | null>(null);
  const [recommendedListing, setRecommendedListing] = useState<LightingListing | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const { toast } = useToast();

  const handleSearchComplete = (result: FindLightingActionState) => {
    const regularResults = result.searchResults?.filter(item => !item.isRecommended) || null;
    const recommended = result.searchResults?.find(item => item.isRecommended) || null;
    
    setSearchResults(regularResults);
    setRecommendedListing(recommended);
    setAiMessage(result.aiMessage);
    
    if (result.errors || result.message?.startsWith('Search failed:') || result.message?.startsWith('Validation failed:')) {
        toast({
            title: "Search Information",
            description: result.message || "Could not complete lighting search.",
            variant: result.errors ? "destructive" : "default"
        });
    }
  };

  const handleSetAlert = () => {
    toast({
      title: "Alert Feature Coming Soon!",
      description: "The ability to set up daily alerts for this lighting search is not yet implemented.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <Sun className="w-8 h-8 mr-3" />
                Lighting Finder
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Looking for specific aquarium lighting? Enter its specifications below and our AI will try to find listings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mb-8">
        <LightingFinderForm onSearchComplete={handleSearchComplete} />
      </div>

      {aiMessage && (
        <Alert variant="default" className="mb-6 bg-accent/20 border-accent/50">
            <Info className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent/90">AI Search Summary</AlertTitle>
            <AlertDescription className="text-accent-foreground/80">
            {aiMessage}
            {(!searchResults || searchResults.length === 0) && !recommendedListing && aiMessage.toLowerCase().includes("alert") && (
                <Button onClick={handleSetAlert} variant="outline" size="sm" className="mt-3">
                    <BellPlus className="w-4 h-4 mr-2" /> Set Alert (Coming Soon)
                </Button>
            )}
            </AlertDescription>
        </Alert>
      )}

      {recommendedListing && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Star className="w-6 h-6 mr-2 text-amber-500" />
            AI Recommended Alternative
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Use same grid for consistency or make it stand out */}
            <LightingListingCard listing={recommendedListing} />
          </div>
           <hr className="my-8" />
        </div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Search className="w-6 h-6 mr-2 text-primary" />
            Search Results for Lighting
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((listing) => (
              <LightingListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
      
      {searchResults === null && !recommendedListing && !isLoading && !aiMessage && (
         <Card className="mt-8">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter lighting specifications above to start your search.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
