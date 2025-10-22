
'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SellerApplicationForm from '@/components/marketplace/SellerApplicationForm';
import { Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { SellerApplicationFormValues } from '@/types';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';


export default function ApplyToSellPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleApplicationSubmit = async (data: SellerApplicationFormValues) => {
    // Simulate API call
    console.log('Seller Application Data:', data);
    setSubmissionError(null); // Clear previous errors

    // Simulate submission success/failure
    await new Promise(resolve => setTimeout(resolve, 1000));
    const success = Math.random() > 0.1; // 90% success rate for demo

    if (success) {
        toast({
        title: 'Application Submitted!',
        description: 'Your application to become a seller has been received. We will review it and get back to you soon.',
        });
        setIsSubmitted(true);
    } else {
        const errorMsg = "There was an issue submitting your application. Please try again later.";
        toast({
            title: 'Submission Failed',
            description: errorMsg,
            variant: 'destructive'
        });
        setSubmissionError(errorMsg);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">Apply to Sell</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Marketplace', href: '/marketplace' },
          { label: 'Apply to Sell' },
        ]}
        className="mb-4"
      />
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-3xl flex items-center text-primary">
            <Edit3 className="w-8 h-8 mr-3" />
            Apply to Sell on AquaDex Marketplace
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 pt-2">
            Join our community of sellers and reach passionate aquarium hobbyists. Fill out the form below to apply.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isSubmitted ? (
            <div className="text-center py-10">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-semibold mb-3">Application Received!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for applying to become a seller on AquaDex. Our team will review your application
                and contact you via email within 3-5 business days regarding your status.
              </p>
              <Button asChild>
                <Link href="/marketplace">Back to Marketplace</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                Please provide some information about yourself and what you plan to sell. All applications are manually reviewed.
                Listing creation is only available for approved sellers.
              </p>
              {submissionError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Submission Error</AlertTitle>
                  <AlertDescription>{submissionError}</AlertDescription>
                </Alert>
              )}
              <SellerApplicationForm onSubmit={handleApplicationSubmit} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
