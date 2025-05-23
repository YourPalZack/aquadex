
'use client';

import { useState } from 'react';
import ImageUploadForm from '@/components/dashboard/ImageUploadForm';
import AnalysisResults from '@/components/dashboard/AnalysisResults';
import TreatmentRecommendations from '@/components/dashboard/TreatmentRecommendations';
import type { AnalyzeTestStripOutput, RecommendTreatmentProductsOutput } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTestStripOutput | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendTreatmentProductsOutput | null>(null);

  const handleAnalysisComplete = (data: { analysis: AnalyzeTestStripOutput; recommendations: RecommendTreatmentProductsOutput | null }) => {
    setAnalysisResult(data.analysis);
    setRecommendations(data.recommendations);
  };

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="space-y-8">
        <Card className="bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-primary flex items-center">
              <Lightbulb className="w-8 h-8 mr-3 text-primary" />
              Welcome to Your Aqua-Dashboard!
            </CardTitle>
            <CardDescription className="text-base text-foreground/80">
              Ready to check your aquarium's water quality? Upload an image of your test strip below.
              For best results, ensure good lighting and a clear photo.
            </CardDescription>
          </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground">
                New to analyzing? Try our <Link href="/analyze/guide" className="text-primary hover:underline">quick guide</Link> for tips on taking good photos.
             </p>
           </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <ImageUploadForm onAnalysisComplete={handleAnalysisComplete} />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <AnalysisResults analysis={analysisResult} />
            <TreatmentRecommendations recommendations={recommendations} />
          </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Explore more features to manage your aquarium.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/history" passHref>
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                        <div className="flex flex-col">
                            <span className="font-semibold">View Test History</span>
                            <span className="text-xs text-muted-foreground">Track your parameters over time.</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/aquariums" passHref>
                     <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                        <div className="flex flex-col">
                            <span className="font-semibold">Manage Aquariums</span>
                            <span className="text-xs text-muted-foreground">Log water changes and tank details.</span>
                        </div>
                    </Button>
                </Link>
                 <Link href="/forum" passHref>
                     <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                        <div className="flex flex-col">
                            <span className="font-semibold">Join Community</span>
                            <span className="text-xs text-muted-foreground">Ask questions and share advice.</span>
                        </div>
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
