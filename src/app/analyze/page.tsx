
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ImageUploadForm from '@/components/dashboard/ImageUploadForm';
import AnalysisResults from '@/components/dashboard/AnalysisResults';
import TreatmentRecommendations from '@/components/dashboard/TreatmentRecommendations';
import { AquariumSelector } from '@/components/aquariums/aquarium-selector';
import { createWaterTest } from '@/lib/actions/water-test';
import type { AnalyzeTestStripOutput, RecommendTreatmentProductsOutput } from '@/types';
import type { WaterParameter } from '@/types/aquarium';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileScan, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const aquariumIdFromUrl = searchParams.get('aquariumId');
  
  const [selectedAquariumId, setSelectedAquariumId] = useState<string>(aquariumIdFromUrl || '');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTestStripOutput | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendTreatmentProductsOutput | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAquariumChange = (aquariumId: string) => {
    setSelectedAquariumId(aquariumId);
    // Update URL with aquarium ID
    const url = new URL(window.location.href);
    url.searchParams.set('aquariumId', aquariumId);
    router.push(url.pathname + url.search, { scroll: false });
  };

  const handleAnalysisComplete = async (data: { 
    analysis: AnalyzeTestStripOutput; 
    recommendations: RecommendTreatmentProductsOutput | null 
  }) => {
    setAnalysisResult(data.analysis);
    setRecommendations(data.recommendations);
    
    // Save test result to database if aquarium is selected
    if (selectedAquariumId) {
      setIsSaving(true);
      try {
        // Create basic water parameters from the text analysis
        // Since the AI returns a string description, we'll save it as notes
        // and create a simple placeholder parameter
        const parameters: WaterParameter[] = [{
          name: 'Test Strip Analysis',
          value: 1,
          unit: '',
          status: 'acceptable' as const,
        }];

        const recommendationTexts = data.recommendations ? 
          [data.recommendations.reasoning, ...data.recommendations.products] : 
          [];

        const result = await createWaterTest({
          aquariumId: selectedAquariumId,
          testDate: new Date(),
          method: 'test-strip',
          parameters,
          recommendations: recommendationTexts,
          notes: data.analysis.waterParameters, // Store the full analysis text as notes
        });

        if (result.error) {
          toast({
            title: 'Warning',
            description: `Test analyzed successfully, but could not save to history: ${result.error}`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Success',
            description: 'Test results saved to aquarium history',
          });
        }
      } catch (error) {
        console.error('Error saving test result:', error);
        toast({
          title: 'Warning',
          description: 'Test analyzed successfully, but could not save to history',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <h1 className="sr-only">Water Test Analyzer</h1>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Water Test' },
          ]}
          className="mb-2"
        />
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

        {/* Aquarium Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Aquarium</CardTitle>
            <CardDescription>
              Choose which aquarium you're testing water for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AquariumSelector 
              value={selectedAquariumId}
              onValueChange={handleAquariumChange}
              label="Aquarium"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <ImageUploadForm 
              onAnalysisComplete={handleAnalysisComplete}
            />
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

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    }>
      <AnalyzePageContent />
    </Suspense>
  );
}
