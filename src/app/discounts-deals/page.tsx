
'use client';

import { useState, useEffect, useActionState } from 'react';
import DealItemCard from '@/components/discounts-deals/DealItemCard';
import type { DealItem } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Percent, Search, Info, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import type { FindDealsActionState } from '@/lib/actions';
import { findAquariumDealsAction } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const initialActionState: FindDealsActionState = {
  message: null,
  errors: null,
  deals: null,
  aiMessage: null,
};

export default function DiscountsDealsPage() {
  const [deals, setDeals] = useState<DealItem[] | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const [actionState, formAction, isActionPending] = useActionState(findAquariumDealsAction, initialActionState);

  const fetchDeals = () => {
    // @ts-ignore // We are not passing formData, so prevState is the first arg by convention for useActionState.
    // Calling formAction will set isActionPending to true and then false when the action completes.
    formAction(); 
  };

  useEffect(() => {
    fetchDeals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch on initial load

  useEffect(() => {
    if (actionState.aiMessage) {
      setAiMessage(actionState.aiMessage);
    }
    if (actionState.deals) {
      setDeals(actionState.deals);
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


  return (
    <div className="container mx-auto py-8">
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
            <Button onClick={fetchDeals} disabled={isActionPending}>
              {isActionPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {isActionPending ? 'Refreshing...' : 'Refresh Deals'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isActionPending && !deals && (
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


      {deals && deals.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Search className="w-6 h-6 mr-2 text-primary" />
            Today's Top Deals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <DealItemCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      )}

      {!isActionPending && deals && deals.length === 0 && !actionState.errors && (
         <Card className="mt-8">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No special deals found by the AI at the moment, or an issue occurred. Try refreshing!</p>
            </CardContent>
        </Card>
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
