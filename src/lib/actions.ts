
'use server';

import { 
    analyzeTestStrip as analyzeTestStripFlow, 
    recommendTreatmentProducts as recommendTreatmentProductsFlow,
    getFoodPurchaseLinks as getFoodPurchaseLinksFlow,
    findFish as findFishFlow // Added findFishFlow
} from '@/ai/flows';
import type { 
    AnalyzeTestStripInput, 
    AnalyzeTestStripOutput, 
    RecommendTreatmentProductsInput, 
    RecommendTreatmentProductsOutput,
    GetFoodPurchaseLinksInput,
    GetFoodPurchaseLinksOutput,
    FishFood,
    WaterTreatmentProduct,
    FindFishInput, // Added FindFishInput
    FindFishOutput // Added FindFishOutput
} from '@/types'; 
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


const addFishFoodFormSchema = z.object({
  name: z.string().min(2, { message: 'Food name must be at least 2 characters.' }),
  brand: z.string().optional(),
  variant: z.string().optional(),
  notes: z.string().optional(),
});

export interface AddFishFoodActionState {
    message: string | null;
    errors: Record<string, string[]> | null;
    newFoodItem: FishFood | null;
}

export async function addFishFoodAction(prevState: AddFishFoodActionState, formData: FormData): Promise<AddFishFoodActionState> {
  try {
    const validatedFields = addFishFoodFormSchema.safeParse({
      name: formData.get('name'),
      brand: formData.get('brand'),
      variant: formData.get('variant'),
      notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed. Please check the form fields.',
        errors: validatedFields.error.flatten().fieldErrors,
        newFoodItem: null,
      };
    }

    const { name, brand, variant, notes } = validatedFields.data;

    const genkitInput: GetFoodPurchaseLinksInput = { foodName: name, brand };
    const purchaseLinksOutput: GetFoodPurchaseLinksOutput = await getFoodPurchaseLinksFlow(genkitInput);

    const newFoodItem: FishFood = {
      id: `food-${Date.now()}`, // Temporary ID generation
      userId: 'user123', // Placeholder user ID
      name,
      brand: brand || undefined,
      variant: variant || undefined,
      notes: notes || undefined,
      amazonLinks: purchaseLinksOutput.amazonLinks || [],
    };
    
    return {
      message: 'Fish food added and links generated successfully!',
      errors: null,
      newFoodItem,
    };

  } catch (error) {
    console.error('Error in addFishFoodAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while adding fish food.';
    return {
      message: `Failed to add fish food: ${errorMessage}`,
      errors: { _form: [errorMessage] },
      newFoodItem: null,
    };
  }
}

const addWaterTreatmentProductFormSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }).max(100, { message: 'Product name cannot exceed 100 characters.' }),
  brand: z.string().max(50, {message: 'Brand cannot exceed 50 characters.'}).optional(),
  type: z.string().max(50, {message: 'Type cannot exceed 50 characters.'}).optional(),
  notes: z.string().max(300, {message: 'Notes cannot exceed 300 characters.'}).optional(),
});

export interface AddWaterTreatmentProductActionState {
    message: string | null;
    errors: Record<string, string[]> | null;
    newProductItem: WaterTreatmentProduct | null;
}

export async function addWaterTreatmentProductAction(prevState: AddWaterTreatmentProductActionState, formData: FormData): Promise<AddWaterTreatmentProductActionState> {
  try {
    const validatedFields = addWaterTreatmentProductFormSchema.safeParse({
      name: formData.get('name'),
      brand: formData.get('brand'),
      type: formData.get('type'),
      notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed. Please check the form fields.',
        errors: validatedFields.error.flatten().fieldErrors,
        newProductItem: null,
      };
    }

    const { name, brand, type, notes } = validatedFields.data;

    // Re-using GetFoodPurchaseLinksInput for treatments as the structure is similar
    const genkitInput: GetFoodPurchaseLinksInput = { foodName: name, brand }; 
    const purchaseLinksOutput: GetFoodPurchaseLinksOutput = await getFoodPurchaseLinksFlow(genkitInput);

    const newProductItem: WaterTreatmentProduct = {
      id: `treatment-${Date.now()}`, 
      userId: 'user123', 
      name,
      brand: brand || undefined,
      type: type || undefined,
      notes: notes || undefined,
      amazonLinks: purchaseLinksOutput.amazonLinks || [],
    };
    
    return {
      message: 'Water treatment product added and links generated successfully!',
      errors: null,
      newProductItem,
    };

  } catch (error) {
    console.error('Error in addWaterTreatmentProductAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while adding water treatment product.';
    return {
      message: `Failed to add water treatment product: ${errorMessage}`,
      errors: { _form: [errorMessage] },
      newProductItem: null,
    };
  }
}

// Fish Finder Action
const findFishSchema = z.object({
  speciesName: z.string().min(2, { message: 'Species name must be at least 2 characters.' }),
});

export interface FindFishActionState {
    message: string | null;
    errors: Record<string, string[]> | null;
    searchResults: FishListing[] | null;
    aiMessage: string | null;
}

export async function findFishAction(prevState: FindFishActionState, formData: FormData): Promise<FindFishActionState> {
  try {
    const validatedFields = findFishSchema.safeParse({
      speciesName: formData.get('speciesName'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed. Please enter a valid species name.',
        errors: validatedFields.error.flatten().fieldErrors,
        searchResults: null,
        aiMessage: null,
      };
    }

    const input: FindFishInput = { speciesName: validatedFields.data.speciesName };
    const result: FindFishOutput = await findFishFlow(input);

    return {
      message: 'Search complete.',
      errors: null,
      searchResults: result.searchResults,
      aiMessage: result.message,
    };
  } catch (error) {
    console.error('Error in findFishAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while searching for fish.';
    return {
      message: `Search failed: ${errorMessage}`,
      errors: { _form: [errorMessage] },
      searchResults: null,
      aiMessage: null,
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
