
'use server';
/**
 * @fileOverview A Genkit flow to find listings for aquarium lighting from various sources.
 *
 * - findLighting - A function that handles the lighting finding process.
 * - FindLightingInput - The input type for the findLighting function.
 * - FindLightingOutput - The return type for the findLighting function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FindLightingInput, FindLightingOutput, LightingListing } from '@/types';

// Define Zod schemas based on the TypeScript interfaces
const LightingListingSchema = z.object({
  id: z.string().describe("A unique ID for this listing item (can be generated, e.g., sourceName-itemId)."),
  sourceName: z.string().describe("The name of the source where the listing was found (e.g., 'Amazon', 'Bulk Reef Supply', 'Marine Depot', 'LEDGrowLightsDepot')."),
  listingTitle: z.string().describe("The title or description of the light listing."),
  price: z.string().optional().describe("The price of the listing, if available (e.g., '$149.99', 'From $80.00')."),
  url: z.string().url().describe("The direct URL to the listing or a search URL for the light on the source website."),
  imageUrl: z.string().url().optional().describe("An optional image URL for the listing. Use https://placehold.co/300x200.png format for placeholders if no real image can be generated."),
  dataAiHint: z.string().optional().describe("If using a placeholder image, provide one or two keywords for Unsplash search (e.g., 'aquarium light', 'LED bar'). Max two words."),
  lightType: z.string().optional().describe("The type of light (e.g., 'LED', 'T5 HO', 'Metal Halide', 'Pendant')."),
  wattageOrPAR: z.string().optional().describe("Wattage or PAR reading if available (e.g., '65W', 'PAR 200 @ 18in depth')."),
  coverageArea: z.string().optional().describe("Recommended coverage area or suitable tank size (e.g., '24-36 inches', 'For 40 Gallon Breeder')."),
  brand: z.string().optional().describe("The brand of the light, if specified or identifiable (e.g., 'AI Hydra', 'Kessil', 'Current USA')."),
  isRecommended: z.boolean().optional().describe("Set to true if this specific listing is an AI-suggested alternative or recommendation based on the search. Only one item in the list should ideally have this set to true.")
});

const FindLightingInputSchema = z.object({
  lightType: z.string().optional().describe('The general type of light (e.g., "LED", "T5", "pendant", "clip-on").'),
  brand: z.string().optional().describe('The preferred brand of the light (e.g., "Kessil", "AquaIllumination", "Fluval").'),
  tankSizeOrCoverage: z.string().optional().describe('The size of the tank or coverage area needed (e.g., "24 inch tank", "for a 75 gallon", "covers 36x24 inches").'),
  keywords: z.string().optional().describe('Any other specific keywords, like "programmable", "full spectrum", "reef capable", "for planted tank", "shimmer effect".'),
});

const FindLightingOutputSchema = z.object({
  searchResults: z.array(LightingListingSchema).describe('A list of found listings for the specified light. If no listings are found, this array will be empty. One of these items MAY be marked with isRecommended: true if it is a specific AI suggestion.'),
  message: z.string().describe("A summary message about the search results. If no results, explain that and mention that the user could (hypothetically) set an alert. If results are found, provide a brief positive message."),
});

export async function findLighting(input: FindLightingInput): Promise<FindLightingOutput> {
  return findLightingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findLightingPrompt',
  input: { schema: FindLightingInputSchema },
  output: { schema: FindLightingOutputSchema },
  prompt: `You are a helpful Aquarium Lighting Finder assistant. The user is looking for a specific type/brand/coverage of aquarium light.

Your task is to simulate searching the following sources for listings matching the user's criteria:
1.  Amazon (amazon.com)
2.  Bulk Reef Supply (bulkreefsupply.com)
3.  Marine Depot (marinedepot.com)
4.  Invent one or two other plausible-sounding "trusted online aquarium supply stores" for this simulation (e.g., "AquaGlow Lighting", "Reef Radiance Systems", "PlantedTankLEDs").

For each listing you "find" (simulate finding), provide:
-   A unique \`id\`.
-   The \`sourceName\`.
-   A realistic \`listingTitle\`.
-   An estimated \`price\`.
-   A plausible-looking \`url\`. For real sites, construct a search URL. For invented stores, create a fictional product page URL.
    (e.g., Amazon: https://www.amazon.com/s?k={{{brand}}}+{{{lightType}}}+aquarium+light+{{{tankSizeOrCoverage}}} )
-   An optional \`imageUrl\`. If you include one, use \`https://placehold.co/300x200.png\`.
-   If using a placeholder image, include a relevant \`dataAiHint\` (e.g., "LED aquarium light", "reef tank light", "{{{lightType}}} {{{brand}}}"). Max two words.
-   The \`lightType\`, \`wattageOrPAR\`, \`coverageArea\`, and \`brand\` if applicable based on user input or common knowledge.

User's Search Criteria:
{{#if lightType}}Light Type: {{{lightType}}}{{/if}}
{{#if brand}}Brand: {{{brand}}}{{/if}}
{{#if tankSizeOrCoverage}}Tank Size/Coverage: {{{tankSizeOrCoverage}}}{{/if}}
{{#if keywords}}Keywords: {{{keywords}}}{{/if}}

If the user provides no criteria, respond with a message asking them to specify what they are looking for, and an empty searchResults array.
If criteria are provided, return at least 2-3 listings if possible, distributed among the sources.

**Special Recommendation Task**:
From the listings you generate, or by thinking of a good alternative, try to identify ONE listing that you think is a particularly good match or a smart alternative based on the user's query. Mark this ONE listing by setting \`isRecommended: true\` in its object. If you cannot confidently make a specific recommendation, it's okay to not set this flag on any item. Do not mark more than one item as recommended.

If no listings are found on ANY source for the given criteria, the \`searchResults\` array should be empty. In this case, the \`message\` field should state that no current listings were found and suggest the user can check back later or (hypothetically) set up an alert.

If listings are found, the \`message\` should be a brief, positive confirmation.

Return the output as a JSON object matching the defined output schema. Ensure all URLs are valid-looking and the structure is correct.
`,
});

const findLightingFlow = ai.defineFlow(
  {
    name: 'findLightingFlow',
    inputSchema: FindLightingInputSchema,
    outputSchema: FindLightingOutputSchema,
  },
  async (input) => {
    if (!input.lightType && !input.brand && !input.tankSizeOrCoverage && !input.keywords) {
      return {
        searchResults: [],
        message: "Please specify the type, brand, coverage, or keywords for the light you're looking for.",
      };
    }

    const { output } = await prompt(input);
    if (!output) {
      return {
        searchResults: [],
        message: `Sorry, I couldn't find any lights matching your criteria at the moment. You might want to try again later or (hypothetically) set up an alert.`,
      };
    }
    const uniqueResults = output.searchResults.map((item, index) => {
        const hintKeywords = (item.brand || input.lightType || 'aquarium light').toLowerCase().split(' ').slice(0,2).join(' ');
        return {
            ...item,
            id: item.id || `${item.sourceName.replace(/\s+/g, '-').toLowerCase()}-light-${index}-${Date.now()}`,
            imageUrl: item.imageUrl || `https://placehold.co/300x200.png`,
            dataAiHint: item.dataAiHint || hintKeywords,
        };
    });

    return { ...output, searchResults: uniqueResults };
  }
);
