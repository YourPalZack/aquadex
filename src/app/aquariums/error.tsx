'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AquariumsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Aquariums error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div>
                <CardTitle>Failed to load aquariums</CardTitle>
                <CardDescription>
                  We couldn't load your aquarium data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              There was an error loading your aquariums. This could be temporary.
              Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-3">
              <Button onClick={reset} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
