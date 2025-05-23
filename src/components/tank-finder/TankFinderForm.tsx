
'use client';

import React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Loader2, AlertCircle, Archive } from 'lucide-react';
import type { FindTankActionState } from '@/lib/actions';
import { findTankAction } from '@/lib/actions';
import { Textarea } from '../ui/textarea';

const initialState: FindTankActionState = {
  message: null,
  errors: null,
  searchResults: null,
  aiMessage: null,
};

interface TankFinderFormProps {
  onSearchComplete: (results: FindTankActionState) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Find Tank
    </Button>
  );
}

export default function TankFinderForm({ onSearchComplete }: TankFinderFormProps) {
  const [state, formAction] = useActionState(findTankAction, initialState);

  React.useEffect(() => {
    if (state.message === 'Search complete.' || (state.message && (state.message.startsWith('Search failed:') || state.message.startsWith('Validation failed.')) )) {
        onSearchComplete(state);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
            <Archive className="w-6 h-6 mr-2 text-primary" />
            Aquarium Tank Search
        </CardTitle>
        <CardDescription>Enter your desired tank specifications. All fields are optional, but provide at least one.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tankType">Tank Type (Optional)</Label>
              <Input
                id="tankType"
                name="tankType"
                type="text"
                placeholder="E.g., Rimless, Nano, Starter Kit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Optional)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="text"
                placeholder="E.g., 10 gallons, 50L, 20-30 gal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Input
                id="brand"
                name="brand"
                type="text"
                placeholder="E.g., Waterbox, Fluval, Aqueon"
              />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="keywords">Other Keywords (Optional)</Label>
              <Textarea
                id="keywords"
                name="keywords"
                placeholder="E.g., low iron glass, peninsula, with stand, black silicone"
                rows={2}
              />
            </div>

          {state?.message && state.message !== 'Search complete.' && (
            <Alert variant={state.errors || state.message?.startsWith('Validation failed') ? "destructive" : "default"} className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{state.errors || state.message?.startsWith('Validation failed') ? 'Error' : 'Status'}</AlertTitle>
              <AlertDescription>
                {state.message}
                {state.errors?.tankType && <p className="mt-1 text-sm">Type: {state.errors.tankType.join(', ')}</p>}
                {state.errors?.capacity && <p className="mt-1 text-sm">Capacity: {state.errors.capacity.join(', ')}</p>}
                {state.errors?.brand && <p className="mt-1 text-sm">Brand: {state.errors.brand.join(', ')}</p>}
                {state.errors?.keywords && <p className="mt-1 text-sm">Keywords: {state.errors.keywords.join(', ')}</p>}
                {state.errors?._form && <p className="mt-1 text-sm">{state.errors._form.join(', ')}</p>}
              </AlertDescription>
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
