
'use client';

import { useState, useEffect, useActionState, startTransition } from 'react';
import DealItemCard from '@/components/discounts-deals/DealItemCard';
import type { DealItem, DealCategory } from '@/types';
import { dealCategories } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Percent, Search, Info, Loader2, RefreshCw, AlertCircle, Tag } from 'lucide-react';
import type { FindDealsActionState } from '@/lib/actions';
import { findAquariumDealsAction } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';

const initialActionState: FindDealsActionState = {
  message: null,
  errors: null,
  deals: null,
  aiMessage: null,
};

export default function DiscountsDealsPage() {
  const [allDeals, setAllDeals] = useState<DealItem[] | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DealCategory | 'All'>('All');
  const { toast } = useToast();

  const [actionState, formAction, isActionPending] = useActionState(findAquariumDealsAction, initialActionState);

  const fetchDeals = () => {
    // @ts-ignore
    formAction(); 
  };

  useEffect(() => {
    startTransition(() => {
      fetchDeals();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch on initial load

  useEffect(() => {
    if (actionState.aiMessage) {
      setAiMessage(actionState.aiMessage);
    }
    if (actionState.deals) {
      setAllDeals(actionState.deals);
    }
    if (actionState.message && actionState.message !== 'Deals search complete.') {
      toast({
        title: actionState.errors ? "Error Fetching Deals" : "Deals Information",
        description: actionState.message,
        variant: actionState.errors ? "destructive" : "default",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionState]);

  const filteredDeals = allDeals && selectedCategory === 'All'
    ? allDeals
    : allDeals?.filter(deal => deal.category === selectedCategory);


  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">Discounts and Deals</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Discounts & Deals' },
        ]}
        className="mb-4"
      />
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <Percent className="w-8 h-8 mr-3" />
                Discounts &amp; Deals
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Discover simulated deals on popular aquarium products. Deals are "updated daily" by our AI.
              </CardDescription>
            </div>
            <Button onClick={() => startTransition(() => fetchDeals())} disabled={isActionPending}>
              {isActionPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {isActionPending ? 'Refreshing...' : 'Refresh Deals'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isActionPending && !allDeals && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Fetching today's deals...</p>
        </div>
      )}

      {aiMessage && (
        <Alert variant="default" className="mb-6 bg-accent/20 border-accent/50">
            <Info className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent/90">AI Deal Summary</AlertTitle>
            <AlertDescription className="text-accent-foreground/80">
              {aiMessage}
            </AlertDescription>
        </Alert>
      )}

      {actionState.errors && actionState.message && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{actionState.message}</AlertDescription>
        </Alert>
      )}

      {allDeals && (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-xl flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-primary" />
                    Filter by Category
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        variant={selectedCategory === 'All' ? 'default' : 'outline'} 
                        onClick={() => setSelectedCategory('All')}
                        size="sm"
                    >
                        All Deals
                    </Button>
                    {dealCategories.map(cat => (
                        <Button 
                            key={cat} 
                            variant={selectedCategory === cat ? 'default' : 'outline'} 
                            onClick={() => setSelectedCategory(cat)}
                            size="sm"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      {filteredDeals && filteredDeals.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Search className="w-6 h-6 mr-2 text-primary" />
            {selectedCategory === 'All' ? "Today's Top Deals" : `Deals for: ${selectedCategory}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <DealItemCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      )}

      {!isActionPending && filteredDeals && filteredDeals.length === 0 && !actionState.errors && (
        <EmptyState
          title={selectedCategory === 'All' ? 'No Deals Found' : `No Deals in ${selectedCategory}`}
          description={selectedCategory === 'All'
            ? 'No special deals found by the AI at the moment. Try refreshing to check again.'
            : 'Try another category or switch back to All Deals.'}
          icon={<Search className="w-10 h-10" />}
          action={(
            <Button size="sm" onClick={() => startTransition(() => fetchDeals())}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh Deals
            </Button>
          )}
        />
      )}
      
      <Alert variant="default" className="mt-8 bg-muted/50 border-border">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-muted-foreground font-semibold">Disclaimer</AlertTitle>
        <AlertDescription className="text-muted-foreground/80">
          The deals shown here are for demonstration purposes and are simulated by an AI. 
          Prices, availability, and actual discounts on Amazon or other stores may vary. 
          Always verify details on the seller's website. Links may contain placeholder referral tags.
        </AlertDescription>
      </Alert>
    </div>
  );
}
