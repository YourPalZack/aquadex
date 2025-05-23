
'use client';

import { useState } from 'react';
import ImageUploadForm from '@/components/dashboard/ImageUploadForm';
import AnalysisResults from '@/components/dashboard/AnalysisResults';
import TreatmentRecommendations from '@/components/dashboard/TreatmentRecommendations';
import type { AnalyzeTestStripOutput, RecommendTreatmentProductsOutput } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileScan, Sparkles } from 'lucide-react';

export default function AnalyzePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTestStripOutput | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendTreatmentProductsOutput | null>(null);

  const handleAnalysisComplete = (data: { analysis: AnalyzeTestStripOutput; recommendations: RecommendTreatmentProductsOutput | null }) => {
    setAnalysisResult(data.analysis);
    setRecommendations(data.recommendations);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                    <FileScan className="w-8 h-8 mr-3 text-primary" />
                    Water Test
                </CardTitle>
                <CardDescription className="text-base">
                    Upload a clear photo of your aquarium test strip. Our AI will analyze the colors and provide you with your water parameters and treatment suggestions.
                </CardDescription>
            </CardHeader>
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
        
        {!analysisResult && (
          <Card className="mt-8 bg-accent/20 border-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-accent" />
                Tips for Accurate Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                <li>Use good, even lighting. Avoid shadows or direct glare on the strip.</li>
                <li>Place the test strip on a plain white background if possible.</li>
                <li>Ensure the photo is in focus and captures all test pads clearly.</li>
                <li>Follow the test strip manufacturer's instructions for timing.</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
