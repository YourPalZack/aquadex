
'use server';
/**
 * @fileOverview A Genkit flow to find listings for aquarium filters from various sources.
 *
 * - findFilter - A function that handles the filter finding process.
 * - FindFilterInput - The input type for the findFilter function.
 * - FindFilterOutput - The return type for the findFilter function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FindFilterInput, FindFilterOutput, FilterListing } from '@/types';

// Define Zod schemas based on the TypeScript interfaces
const FilterListingSchema = z.object({
  id: z.string().describe("A unique ID for this listing item (can be generated, e.g., sourceName-itemId)."),
  sourceName: z.string().describe("The name of the source where the listing was found (e.g., 'Amazon', 'AquaForest Supplies', 'ClearChoice Aquatics')."),
  listingTitle: z.string().describe("The title or description of the filter listing."),
  price: z.string().optional().describe("The price of the listing, if available (e.g., '$49.99', 'From $25.00')."),
  url: z.string().url().describe("The direct URL to the listing or a search URL for the filter on the source website."),
  imageUrl: z.string().url().optional().describe("An optional image URL for the listing. Use https://placehold.co/300x200.png format for placeholders if no real image can be generated."),
  dataAiHint: z.string().optional().describe("If using a placeholder image, provide one or two keywords for Unsplash search (e.g., 'aquarium filter', 'canister filter'). Max two words."),
  filterType: z.string().optional().describe("The type of filter (e.g., 'Canister', 'HOB - Hang On Back', 'Sponge', 'Internal')."),
  flowRate: z.string().optional().describe("The flow rate of the filter (e.g., '250 GPH', '1000 L/H')."),
  suitableTankSize: z.string().optional().describe("Recommended tank size for this filter (e.g., 'Up to 50 Gallons', 'For 20-40L tanks')."),
  brand: z.string().optional().describe("The brand of the filter, if specified or identifiable (e.g., 'Fluval', 'Eheim', 'AquaClear').")
});

const FindFilterInputSchema = z.object({
  filterType: z.string().optional().describe('The general type of filter (e.g., "canister", "HOB", "sponge", "internal sump").'),
  brand: z.string().optional().describe('The preferred brand of the filter (e.g., "Fluval", "Eheim", "Marineland").'),
  tankSizeGallons: z.string().optional().describe('The approximate size of the tank the filter is for, in gallons (e.g., "20", "55", "125"). This helps determine appropriate flow rate/capacity.'),
  keywords: z.string().optional().describe('Any other specific keywords, like "quiet operation", "self-priming", "with UV sterilizer", "for planted tank".'),
});

const FindFilterOutputSchema = z.object({
  searchResults: z.array(FilterListingSchema).describe('A list of found listings for the specified filter. If no listings are found, this array will be empty.'),
  message: z.string().describe("A summary message about the search results. If no results, explain that and mention that the user could (hypothetically) set an alert. If results are found, provide a brief positive message."),
});

export async function findFilter(input: FindFilterInput): Promise<FindFilterOutput> {
  return findFilterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findFilterPrompt',
  input: { schema: FindFilterInputSchema },
  output: { schema: FindFilterOutputSchema },
  prompt: `You are a helpful Aquarium Filtration Finder assistant. The user is looking for a specific type/brand/capacity of aquarium filter.

Your task is to simulate searching the following sources for listings matching the user's criteria:
1.  Amazon (amazon.com)
2.  Invent two or three other plausible-sounding "trusted online aquarium supply stores" for this simulation (e.g., "AquaForest Supplies", "CrystalClear Filtration", "ReefSystems Pro", "Pristine Aquatics Gear").

For each listing you "find" (simulate finding), provide:
-   A unique \`id\` for the listing (e.g., "amazon-filter-123", "aquaforest-hob-xyz").
-   The \`sourceName\`.
-   A realistic \`listingTitle\` for the filter based on the criteria.
-   An estimated \`price\` if it makes sense.
-   A \`url\`. This should be a plausible-looking URL. For Amazon, construct a search URL. For invented stores, create a fictional product page URL. (e.g., Amazon: https://www.amazon.com/s?k={{{brand}}}+{{{filterType}}}+aquarium+filter+{{{tankSizeGallons}}}gallon )
-   An optional \`imageUrl\`. If you include one, use a placeholder image from \`https://placehold.co/300x200.png\`.
-   If using a placeholder image, include a relevant \`dataAiHint\` (e.g., "canister filter", "aquarium HOB", "{{{filterType}}} {{{brand}}}"). Max two words.
-   The \`filterType\` (e.g., "Canister", "HOB", "Sponge"). Try to match user input if provided.
-   A plausible \`flowRate\` for the filter (e.g., "150 GPH", "600 L/H").
-   A \`suitableTankSize\` (e.g., "Up to 30 Gallons", "For 75-100L tanks"). Base this on user input for \`tankSizeGallons\` if provided.
-   The \`brand\` of the filter if specified by user or commonly associated with the type.

User's Search Criteria:
{{#if filterType}}Filter Type: {{{filterType}}}{{/if}}
{{#if brand}}Brand: {{{brand}}}{{/if}}
{{#if tankSizeGallons}}For Tank Size (Gallons): {{{tankSizeGallons}}}{{/if}}
{{#if keywords}}Keywords: {{{keywords}}}{{/if}}

If the user provides no criteria, respond with a message asking them to specify what they are looking for, and an empty searchResults array.
If criteria are provided, return at least 2-3 listings if possible, distributed among the sources. If you simulate finding no listings on a particular source, do not include an entry for it in searchResults.

If no listings are found on ANY source for the given criteria, the \`searchResults\` array should be empty. In this case, the \`message\` field should state that no current listings were found and suggest the user can check back later or (hypothetically) set up an alert.

If listings are found, the \`message\` should be a brief, positive confirmation like "Here are some filter listings I found matching your criteria!".

Return the output as a JSON object matching the defined output schema. Ensure all URLs are valid-looking and the structure is correct.
`,
});

const findFilterFlow = ai.defineFlow(
  {
    name: 'findFilterFlow',
    inputSchema: FindFilterInputSchema,
    outputSchema: FindFilterOutputSchema,
  },
  async (input) => {
    if (!input.filterType && !input.brand && !input.tankSizeGallons && !input.keywords) {
      return {
        searchResults: [],
        message: "Please specify the type, brand, tank size, or keywords for the filter you're looking for.",
      };
    }

    const { output } = await prompt(input);
    if (!output) {
      return {
        searchResults: [],
        message: `Sorry, I couldn't find any filters matching your criteria at the moment. You might want to try again later or (hypothetically) set up an alert.`,
      };
    }
    const uniqueResults = output.searchResults.map((item, index) => {
        const hintKeywords = (item.brand || input.filterType || 'aquarium filter').toLowerCase().split(' ').slice(0,2).join(' ');
        return {
            ...item,
            id: item.id || `${item.sourceName.replace(/\s+/g, '-').toLowerCase()}-filter-${index}-${Date.now()}`,
            imageUrl: item.imageUrl || `https://placehold.co/300x200.png`,
            dataAiHint: item.dataAiHint || hintKeywords,
        };
    });

    return { ...output, searchResults: uniqueResults };
  }
);
