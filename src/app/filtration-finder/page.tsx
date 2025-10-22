
'use client';

import { useState } from 'react';
import FiltrationFinderForm from '@/components/filtration-finder/FiltrationFinderForm';
import FilterListingCard from '@/components/filtration-finder/FilterListingCard';
import type { FilterListing } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Filter as FilterIcon, Search, Info, BellPlus } from 'lucide-react';
import type { FindFilterActionState } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';

export default function FiltrationFinderPage() {
  const [searchResults, setSearchResults] = useState<FilterListing[] | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const { toast } = useToast();

  const handleSearchComplete = (result: FindFilterActionState) => {
    setSearchResults(result.searchResults);
    setAiMessage(result.aiMessage);
    // setIsLoading(false); // Form status handles its own loading indicator
    if (result.errors || result.message?.startsWith('Search failed:') || result.message?.startsWith('Validation failed:')) {
        toast({
            title: "Search Information",
            description: result.message || "Could not complete filter search.",
            variant: result.errors ? "destructive" : "default"
        });
    }
  };

  const handleSetAlert = () => {
    toast({
      title: "Alert Feature Coming Soon!",
      description: "The ability to set up daily alerts for this filter search is not yet implemented.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">Filtration Finder</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Filtration Finder' },
        ]}
        className="mb-4"
      />
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <FilterIcon className="w-8 h-8 mr-3" />
                Filtration Finder
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Looking for a specific aquarium filter? Enter its specifications below and our AI will try to find listings from various online sources.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mb-8">
        <FiltrationFinderForm onSearchComplete={handleSearchComplete} />
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
            Search Results for Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((listing) => (
              <FilterListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {searchResults === null && !isLoading && !aiMessage && (
        <EmptyState
          title="Start Your Search"
          description="Enter filter specifications above to find listings."
          icon={<Search className="w-10 h-10" />}
        />
      )}
    </div>
  );
}
