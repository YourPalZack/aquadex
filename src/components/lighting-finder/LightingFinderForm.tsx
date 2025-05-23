
'use client';

import React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Loader2, AlertCircle, Sun } from 'lucide-react';
import type { FindLightingActionState } from '@/lib/actions';
import { findLightingAction } from '@/lib/actions';
import { Textarea } from '../ui/textarea';

const initialState: FindLightingActionState = {
  message: null,
  errors: null,
  searchResults: null,
  aiMessage: null,
};

interface LightingFinderFormProps {
  onSearchComplete: (results: FindLightingActionState) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Find Lighting
    </Button>
  );
}

export default function LightingFinderForm({ onSearchComplete }: LightingFinderFormProps) {
  const [state, formAction] = useActionState(findLightingAction, initialState);

  React.useEffect(() => {
    if (state.message === 'Search complete.' || (state.message && (state.message.startsWith('Search failed:') || state.message.startsWith('Validation failed.')))) {
        onSearchComplete(state);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
            <Sun className="w-6 h-6 mr-2 text-primary" />
            Aquarium Lighting Search
        </CardTitle>
        <CardDescription>Enter your desired lighting specifications. All fields are optional, but provide at least one.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lightType">Light Type (Optional)</Label>
              <Input
                id="lightType"
                name="lightType"
                type="text"
                placeholder="E.g., LED, T5 HO, Pendant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Input
                id="brand"
                name="brand"
                type="text"
                placeholder="E.g., Kessil, AI Hydra, Fluval Plant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tankSizeOrCoverage">Tank Size/Coverage (Optional)</Label>
              <Input
                id="tankSizeOrCoverage"
                name="tankSizeOrCoverage"
                type="text"
                placeholder="E.g., 24 inch, 75 gallon, 36x24"
              />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="keywords">Other Keywords (Optional)</Label>
              <Textarea
                id="keywords"
                name="keywords"
                placeholder="E.g., programmable, full spectrum, shimmer, reef-capable"
                rows={2}
              />
            </div>

          {state?.message && state.message !== 'Search complete.' && (
            <Alert variant={state.errors || state.message?.startsWith('Validation failed') ? "destructive" : "default"} className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{state.errors || state.message?.startsWith('Validation failed') ? 'Error' : 'Status'}</AlertTitle>
              <AlertDescription>
                {state.message}
                {state.errors?.lightType && <p className="mt-1 text-sm">Type: {state.errors.lightType.join(', ')}</p>}
                {state.errors?.brand && <p className="mt-1 text-sm">Brand: {state.errors.brand.join(', ')}</p>}
                {state.errors?.tankSizeOrCoverage && <p className="mt-1 text-sm">Coverage: {state.errors.tankSizeOrCoverage.join(', ')}</p>}
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
