'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { RecommendTreatmentProductsOutput } from '@/types';
import { CheckCircle, Info, Lightbulb, ExternalLink } from 'lucide-react';

interface TreatmentRecommendationsProps {
  recommendations: RecommendTreatmentProductsOutput | null;
}

export default function TreatmentRecommendations({ recommendations }: TreatmentRecommendationsProps) {
  if (!recommendations) {
    return (
       <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle>Treatment Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions for your aquarium.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Lightbulb className="h-10 w-10 mb-2" />
            <p>No recommendations available yet. Analyze a test strip first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const hasProducts = recommendations.products && recommendations.products.length > 0;

  return (
    <Card className="w-full mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Treatment Recommendations</CardTitle>
        <CardDescription>AI-powered suggestions based on your water analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-primary" />
            Reasoning:
          </h3>
          <p className="text-muted-foreground bg-muted p-3 rounded-md">{recommendations.reasoning || "No specific reasoning provided."}</p>
        </div>
        
        {hasProducts ? (
            <div>
            <h3 className="font-semibold text-lg mb-2">Recommended Products:</h3>
            <ul className="space-y-3">
                {recommendations.products.map((product, index) => (
                <li key={index} className="p-3 border rounded-md bg-card hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-center">
                    <span className="font-medium">{product}</span>
                    {/* Placeholder for Amazon link. Actual API integration is complex. */}
                    <a 
                        href={`https://www.amazon.com/s?k=${encodeURIComponent(product + " aquarium")}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center"
                        aria-label={`Search for ${product} on Amazon`}
                    >
                        Find on Amazon <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                    </div>
                </li>
                ))}
            </ul>
            </div>
        ) : (
            <div className="flex items-center text-green-600 bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
                <CheckCircle className="h-5 w-5 mr-2" />
                <p>No specific products recommended. Your water parameters might be within ideal ranges or require general maintenance.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <Info className="h-4 w-4 mr-1.5" />
        Product recommendations are AI-generated. Always research products and follow manufacturer instructions.
      </CardFooter>
    </Card>
  );
}