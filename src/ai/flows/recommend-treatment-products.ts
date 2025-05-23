'use server';
/**
 * @fileOverview Recommends treatment products based on water parameter analysis.
 *
 * - recommendTreatmentProducts - A function that recommends treatment products.
 * - RecommendTreatmentProductsInput - The input type for the recommendTreatmentProducts function.
 * - RecommendTreatmentProductsOutput - The return type for the recommendTreatmentProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendTreatmentProductsInputSchema = z.object({
  analysis: z
    .string()
    .describe(
      'The analysis of the water parameters, including specific issues detected.'
    ),
});
export type RecommendTreatmentProductsInput = z.infer<
  typeof RecommendTreatmentProductsInputSchema
>;

const RecommendTreatmentProductsOutputSchema = z.object({
  products: z
    .array(z.string())
    .describe(
      'A list of recommended treatment products, including brand and product name.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the product recommendations based on the water parameter analysis.'
    ),
});
export type RecommendTreatmentProductsOutput = z.infer<
  typeof RecommendTreatmentProductsOutputSchema
>;

export async function recommendTreatmentProducts(
  input: RecommendTreatmentProductsInput
): Promise<RecommendTreatmentProductsOutput> {
  return recommendTreatmentProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendTreatmentProductsPrompt',
  input: {schema: RecommendTreatmentProductsInputSchema},
  output: {schema: RecommendTreatmentProductsOutputSchema},
  prompt: `You are an expert aquarium advisor. Based on the water parameter analysis provided, recommend specific treatment products to address any identified issues. Provide the brand and product name. Explain the reasoning behind each recommendation.

Analysis: {{{analysis}}}`,
});

const recommendTreatmentProductsFlow = ai.defineFlow(
  {
    name: 'recommendTreatmentProductsFlow',
    inputSchema: RecommendTreatmentProductsInputSchema,
    outputSchema: RecommendTreatmentProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
