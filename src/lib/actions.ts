'use server';

import { analyzeTestStrip as analyzeTestStripFlow, recommendTreatmentProducts as recommendTreatmentProductsFlow } from '@/ai/flows';
import type { AnalyzeTestStripInput, AnalyzeTestStripOutput, RecommendTreatmentProductsInput, RecommendTreatmentProductsOutput } from '@/ai/flows';
import { z } from 'zod';

const analyzeStripSchema = z.object({
  photoDataUri: z.string().min(1, { message: 'Image data URI is required.' }),
});

export async function analyzeStrip(prevState: any, formData: FormData) {
  try {
    const validatedFields = analyzeStripSchema.safeParse({
      photoDataUri: formData.get('photoDataUri'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed.',
        errors: validatedFields.error.flatten().fieldErrors,
        analysis: null,
        recommendations: null,
      };
    }

    const input: AnalyzeTestStripInput = {
      photoDataUri: validatedFields.data.photoDataUri,
    };
    
    const analysisResult: AnalyzeTestStripOutput = await analyzeTestStripFlow(input);

    // Optionally, immediately get recommendations
    const recommendationInput: RecommendTreatmentProductsInput = {
      analysis: analysisResult.waterParameters,
    };
    const recommendationsResult: RecommendTreatmentProductsOutput = await recommendTreatmentProductsFlow(recommendationInput);

    return {
      message: 'Analysis successful.',
      analysis: analysisResult,
      recommendations: recommendationsResult,
      errors: null,
    };
  } catch (error) {
    console.error('Error in analyzeStrip action:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
    return {
      message: `Analysis failed: ${errorMessage}`,
      analysis: null,
      recommendations: null,
      errors: { _form: [errorMessage] } ,
    };
  }
}

const recommendProductsSchema = z.object({
  analysis: z.string().min(1, { message: 'Analysis data is required.' }),
});

export async function getRecommendations(prevState: any, formData: FormData) {
  try {
    const validatedFields = recommendProductsSchema.safeParse({
      analysis: formData.get('analysis'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed.',
        errors: validatedFields.error.flatten().fieldErrors,
        recommendations: null,
      };
    }
    
    const input: RecommendTreatmentProductsInput = {
      analysis: validatedFields.data.analysis,
    };
    const recommendationsResult: RecommendTreatmentProductsOutput = await recommendTreatmentProductsFlow(input);

    return {
      message: 'Recommendations fetched successfully.',
      recommendations: recommendationsResult,
      errors: null,
    };
  } catch (error) {
    console.error('Error in getRecommendations action:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching recommendations.';
    return {
      message: `Failed to fetch recommendations: ${errorMessage}`,
      recommendations: null,
      errors: { _form: [errorMessage] },
    };
  }
}

// Placeholder for saving test results
export async function saveTestResult(data: any) {
  // This would interact with Firestore or another database
  console.log('Saving test result:', data);
  // Simulate success
  return { success: true, message: 'Test result saved (simulated).' };
}

// Placeholder for adding an aquarium
export async function addAquarium(data: any) {
  console.log('Adding aquarium:', data);
  return { success: true, message: 'Aquarium added (simulated).' };
}