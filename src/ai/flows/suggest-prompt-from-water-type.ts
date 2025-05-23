'use server';

/**
 * @fileOverview Provides example test prompts based on common aquarium types to help new users get started.
 *
 * - suggestPromptFromWaterType - A function that suggests example test prompts.
 * - SuggestPromptFromWaterTypeInput - The input type for the suggestPromptFromWaterType function.
 * - SuggestPromptFromWaterTypeOutput - The return type for the suggestPromptFromWaterType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPromptFromWaterTypeInputSchema = z.object({
  aquariumType: z
    .string()
    .describe('The type of aquarium (e.g., freshwater, saltwater, reef).'),
});
export type SuggestPromptFromWaterTypeInput = z.infer<
  typeof SuggestPromptFromWaterTypeInputSchema
>;

const SuggestPromptFromWaterTypeOutputSchema = z.object({
  examplePrompts: z
    .array(z.string())
    .describe('Example test prompts suitable for the specified aquarium type.'),
});
export type SuggestPromptFromWaterTypeOutput = z.infer<
  typeof SuggestPromptFromWaterTypeOutputSchema
>;

export async function suggestPromptFromWaterType(
  input: SuggestPromptFromWaterTypeInput
): Promise<SuggestPromptFromWaterTypeOutput> {
  return suggestPromptFromWaterTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPromptFromWaterTypePrompt',
  input: {schema: SuggestPromptFromWaterTypeInputSchema},
  output: {schema: SuggestPromptFromWaterTypeOutputSchema},
  prompt: `You are an aquarium expert. A user with a {{{aquariumType}}} aquarium wants to analyze their water.

  Suggest three example prompts they can use to test their water quality. The prompts should be simple and easy to understand.

  {{json examplePrompts}}`,
});

const suggestPromptFromWaterTypeFlow = ai.defineFlow(
  {
    name: 'suggestPromptFromWaterTypeFlow',
    inputSchema: SuggestPromptFromWaterTypeInputSchema,
    outputSchema: SuggestPromptFromWaterTypeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
