'use client';

import { useState, type ChangeEvent, type FormEvent, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { analyzeStrip } from '@/lib/actions';
import type { AnalyzeTestStripOutput, RecommendTreatmentProductsOutput } from '@/types';

interface ImageUploadFormProps {
  onAnalysisComplete: (data: { analysis: AnalyzeTestStripOutput; recommendations: RecommendTreatmentProductsOutput | null }) => void;
}

const initialState = {
  message: null,
  analysis: null,
  recommendations: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
      Analyze Strip
    </Button>
  );
}

export default function ImageUploadForm({ onAnalysisComplete }: ImageUploadFormProps) {
  const [state, formAction] = useFormState(analyzeStrip, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [srMessage, setSrMessage] = useState<string>('');

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setPhotoDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setPhotoDataUri('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!photoDataUri) {
        // Handle case where photoDataUri is not set, perhaps show an error
        console.error("No image selected for upload.");
        return;
    }
    const formData = new FormData(event.currentTarget);
    formData.set('photoDataUri', photoDataUri); // Ensure photoDataUri is part of formData for server action

    // @ts-ignore TODO: Fix type later if possible
    try {
      setIsAnalyzing(true);
      setSrMessage('Analyzing image…');
      const result = await analyzeStrip(null, formData);
      if (result.analysis) {
        onAnalysisComplete({ analysis: result.analysis, recommendations: result.recommendations });
        setSrMessage('Analysis complete. Results are available below.');
      }
    } finally {
      setIsAnalyzing(false);
    }
    // The useFormState hook will update `state` with the result, no need to call setState here for `state` itself
  };


  return (
    <Card className="w-full max-w-md" aria-busy={isAnalyzing || undefined}>
      <CardHeader>
        <CardTitle>Upload Test Strip Image</CardTitle>
        <CardDescription id="upload-desc">Select an image of your aquarium test strip for AI analysis.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        {/* Screen reader live region for analysis status */}
        <p aria-live="polite" role="status" className="sr-only">{srMessage}</p>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-strip-image">Test Strip Image</Label>
            <Input
              id="test-strip-image"
              name="imageFile" // Name for the file input itself, though we use data URI
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="file:text-primary file:font-semibold"
              aria-describedby="upload-desc"
              required
            />
             {/* Hidden input to carry the data URI */}
            <input type="hidden" name="photoDataUri" value={photoDataUri} />
          </div>

          {preview && (
            <div className="mt-4 border rounded-md p-2 aspect-video relative overflow-hidden">
              <Image src={preview} alt="Preview of selected test strip" fill style={{ objectFit: 'contain' }} />
            </div>
          )}

          {state?.message && !state.analysis && (
            <Alert variant={state.errors ? "destructive" : "default"} role={state.errors ? 'alert' : 'status'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{state.errors ? 'Error' : 'Status'}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
              {state.errors && (
                <ul className="mt-2 list-disc list-inside text-sm">
                   {Object.entries(state.errors).map(([key, value]) => 
                    Array.isArray(value) && value.map((err: string, i: number) => <li key={`${key}-${i}`}>{err}</li>)
                  )}
                </ul>
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
