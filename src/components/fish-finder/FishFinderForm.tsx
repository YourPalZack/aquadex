
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import type { FindFishActionState } from '@/lib/actions';
import { findFishAction } from '@/lib/actions';

const initialState: FindFishActionState = {
  message: null,
  errors: null,
  searchResults: null,
  aiMessage: null,
};

interface FishFinderFormProps {
  onSearchComplete: (results: FindFishActionState) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Find Fish
    </Button>
  );
}

export default function FishFinderForm({ onSearchComplete }: FishFinderFormProps) {
  const [state, formAction] = useFormState(findFishAction, initialState);

  React.useEffect(() => {
    if (state.message === 'Search complete.' || (state.message && state.message.startsWith('Search failed:'))) {
        onSearchComplete(state);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fish Species Search</CardTitle>
        <CardDescription>Enter the name of the fish or invertebrate you're looking for.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="speciesName" className="sr-only">Species Name</Label>
            <Input
              id="speciesName"
              name="speciesName"
              type="text"
              placeholder="E.g., Betta splendens, Neocaridina shrimp, Clownfish"
              required
            />
          </div>
          {state?.message && state.message !== 'Search complete.' && (
            <Alert variant={state.errors ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{state.errors ? 'Error' : 'Status'}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
              {state.errors && state.errors.speciesName && (
                <p className="mt-1 text-sm">{state.errors.speciesName.join(', ')}</p>
              )}
               {state.errors && state.errors._form && (
                <p className="mt-1 text-sm">{state.errors._form.join(', ')}</p>
              )}
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
