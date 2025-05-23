
'use server';
/**
 * @fileOverview Generates Amazon purchase links for fish food items.
 *
 * - getFoodPurchaseLinks - A function that generates Amazon search links for a given fish food.
 * - GetFoodPurchaseLinksInput - The input type for the getFoodPurchaseLinks function.
 * - GetFoodPurchaseLinksOutput - The return type for the getFoodPurchaseLinks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetFoodPurchaseLinksInputSchema = z.object({
  foodName: z.string().describe('The specific name of the fish food (e.g., "Hikari Cichlid Gold Pellets").'),
  brand: z.string().optional().describe('The brand of the fish food (e.g., "Hikari").'),
  // variant: z.string().optional().describe('The specific variant or size of the food (e.g., "Medium Pellet", "8.8 oz").')
});
export type GetFoodPurchaseLinksInput = z.infer<typeof GetFoodPurchaseLinksInputSchema>;

const GetFoodPurchaseLinksOutputSchema = z.object({
  amazonLinks: z.array(z.object({
    storeName: z.string().describe("The Amazon store region (e.g., Amazon US, Amazon UK, Amazon CA, Amazon DE)."),
    url: z.string().url().describe("The full Amazon search URL, including a placeholder for the user's referral tag."),
  })).describe("A list of Amazon search links for the specified fish food item across different regions. Ensure the referral tag placeholder is 'YOUR_AMAZON_TAG-XX' where XX is the region specific suffix if applicable, e.g., YOUR_AMAZON_TAG-20 for US, YOUR_AMAZON_TAG-21 for UK."),
});
export type GetFoodPurchaseLinksOutput = z.infer<typeof GetFoodPurchaseLinksOutputSchema>;

export async function getFoodPurchaseLinks(input: GetFoodPurchaseLinksInput): Promise<GetFoodPurchaseLinksOutput> {
  return getFoodPurchaseLinksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getFoodPurchaseLinksPrompt',
  input: {schema: GetFoodPurchaseLinksInputSchema},
  output: {schema: GetFoodPurchaseLinksOutputSchema},
  prompt: `You are an expert assistant helping aquarium hobbyists find fish food on Amazon.
Given the fish food name and optionally its brand, generate Amazon search links.

Your task is to construct search URLs for the following Amazon regional stores:
- Amazon US (amazon.com)
- Amazon UK (amazon.co.uk)
- Amazon Canada (amazon.ca)
- Amazon Germany (amazon.de)

For each store, the search URL should be in the format: https://www.amazon.{domain}/s?k={search_terms}&tag={referral_tag}

- Replace {domain} with the correct Amazon domain for the region.
- Replace {search_terms} with the URL-encoded food name and brand (if provided). For example, if foodName is "Hikari Gold" and brand is "Hikari", search_terms could be "Hikari+Gold".
- CRITICAL: For {referral_tag}, use the following placeholders:
    - For Amazon US (amazon.com): 'YOUR_AMAZON_TAG-20'
    - For Amazon UK (amazon.co.uk): 'YOUR_AMAZON_TAG_UK-21'
    - For Amazon Canada (amazon.ca): 'YOUR_AMAZON_TAG_CA-20'
    - For Amazon Germany (amazon.de): 'YOUR_AMAZON_TAG_DE-21'

Please provide links for all four regions.

Food Details:
Name: {{{foodName}}}
{{#if brand}}
Brand: {{{brand}}}
{{/if}}
{{#if variant}}
Variant/Size: {{{variant}}}
{{/if}}

Return the output as a JSON object matching the defined output schema.
Example for storeName: "Amazon US", "Amazon UK", etc.
`,
});

const getFoodPurchaseLinksFlow = ai.defineFlow(
  {
    name: 'getFoodPurchaseLinksFlow',
    inputSchema: GetFoodPurchaseLinksInputSchema,
    outputSchema: GetFoodPurchaseLinksOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to get a response from the AI model for purchase links.");
    }
    // Ensure at least one link is returned, or a sensible default/error.
    // For now, we rely on the schema validation and the prompt to produce the desired output.
    return output;
  }
);
