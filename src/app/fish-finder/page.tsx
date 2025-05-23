
'use client';

import { useState } from 'react';
import FishFinderForm from '@/components/fish-finder/FishFinderForm';
import FishListingCard from '@/components/fish-finder/FishListingCard';
import type { FishListing, FindFishOutput } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Fish, Search, Info, BellPlus } from 'lucide-react';
import type { FindFishActionState } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function FishFinderPage() {
  const [searchResults, setSearchResults] = useState<FishListing[] | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For overall page loading state if needed, not directly tied to formStatus
  const { toast } = useToast();

  const handleSearchComplete = (result: FindFishActionState) => {
    setSearchResults(result.searchResults);
    setAiMessage(result.aiMessage);
    setIsLoading(false); // Assuming formStatus handles its own loading indicator
    if (result.errors) {
        toast({
            title: "Search Error",
            description: result.message || "Could not complete search.",
            variant: "destructive"
        });
    }
  };

  const handleSetAlert = () => {
    // Placeholder for future alert functionality
    toast({
      title: "Alert Feature Coming Soon!",
      description: "The ability to set up daily alerts for this species is not yet implemented.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <Fish className="w-8 h-8 mr-3" />
                Fish Finder
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Looking for a specific fish or invertebrate? Enter its name below and our AI will try to find listings from various online sources.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mb-8">
        <FishFinderForm onSearchComplete={handleSearchComplete} />
      </div>

      {aiMessage && (
        <Alert variant="default" className="mb-6 bg-accent/20 border-accent/50">
            <Info className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent/90">AI Search Summary</AlertTitle>
            <AlertDescription className="text-accent-foreground/80">
            {aiMessage}
            {/* Conditionally show "Set Alert" button if no results and AI message suggests it */}
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
            Search Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((listing) => (
              <FishListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {searchResults === null && !isLoading && !aiMessage && (
         <Card className="mt-8">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter a species name above to start your search.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
