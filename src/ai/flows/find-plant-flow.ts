
'use server';
/**
 * @fileOverview A Genkit flow to find listings for aquatic plants from various sources.
 *
 * - findPlant - A function that handles the plant finding process.
 * - FindPlantInput - The input type for the findPlant function.
 * - FindPlantOutput - The return type for the findPlant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FindPlantInput, FindPlantOutput, PlantListing } from '@/types';

// Define Zod schemas based on the TypeScript interfaces
const PlantListingSchema = z.object({
  id: z.string().describe("A unique ID for this listing item (can be generated, e.g., sourceName-itemId)."),
  sourceName: z.string().describe("The name of the source where the listing was found (e.g., 'Ebay', 'Etsy', 'Amazon', 'Aquarium Co-Op', 'AquaFlora Nursery')."),
  listingTitle: z.string().describe("The title or description of the plant listing."),
  price: z.string().optional().describe("The price of the listing, if available (e.g., '$9.99', '3 stems for $12.50')."),
  url: z.string().url().describe("The direct URL to the listing or a search URL for the species on the source website."),
  imageUrl: z.string().url().optional().describe("An optional image URL for the listing. Use https://placehold.co/300x200.png format for placeholders if no real image can be generated."),
  dataAiHint: z.string().optional().describe("If using a placeholder image, provide one or two keywords for Unsplash search (e.g., 'aquatic plant', 'anubias'). Max two words.")
});

const FindPlantInputSchema = z.object({
  speciesName: z.string().describe('The scientific or common name of the aquatic plant species to search for.'),
});

const FindPlantOutputSchema = z.object({
  searchResults: z.array(PlantListingSchema).describe('A list of found listings for the specified plant species. If no listings are found, this array will be empty.'),
  message: z.string().describe("A summary message about the search results. If no results, explain that and mention that the user could (hypothetically) set an alert. If results are found, provide a brief positive message."),
});

export async function findPlant(input: FindPlantInput): Promise<FindPlantOutput> {
  return findPlantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findPlantPrompt',
  input: { schema: FindPlantInputSchema },
  output: { schema: FindPlantOutputSchema },
  prompt: `You are a helpful Aquatic Plant Finder assistant. The user is looking for a specific aquatic plant.

Your task is to simulate searching the following sources for listings of the specified plant species:
1.  Ebay (ebay.com)
2.  Etsy (etsy.com)
3.  Amazon (amazon.com)
4.  Aquarium Co-Op (aquariumcoop.com)
5.  Invent one or two other plausible-sounding "trusted online aquatic plant stores" for this simulation (e.g., "AquaFlora Nursery", "GreenScape Aquatics", "Submerged Sanctuaries").

For each listing you "find" (simulate finding), provide:
-   A unique \`id\` for the listing (e.g., "ebay-plant-123", "etsy-plant-xyz").
-   The \`sourceName\`.
-   A realistic \`listingTitle\` for the species (e.g., "Anubias Nana Petite Live Aquarium Plant", "Java Fern Microsorum Pteropus Easy Aquatic Plant Bunch").
-   An estimated \`price\` if it makes sense (e.g., "$8.99", "Bunch of 5 for $10.00").
-   A \`url\`. This should be a plausible-looking URL. For real sites like eBay, Etsy, Amazon, construct a search URL (e.g., https://www.ebay.com/sch/i.html?_nkw={{{speciesName}}}, https://www.etsy.com/search?q={{{speciesName}}}, https://www.amazon.com/s?k={{{speciesName}}}, https://aquariumcoop.com/search?q={{{speciesName}}}). For your invented stores, you can create a fictional product page URL.
-   An optional \`imageUrl\`. If you include one, use a placeholder image from \`https://placehold.co/300x200.png\`.
-   If using a placeholder image, include a relevant \`dataAiHint\` (e.g., "java fern", "aquatic plant", "{{{speciesName}}}"). Max two words.

Species to search for: {{{speciesName}}}

Return at least 2-3 listings if possible, distributed among the sources. If you simulate finding no listings on a particular source, do not include an entry for it in searchResults.

If no listings are found on ANY source for "{{{speciesName}}}", the \`searchResults\` array should be empty. In this case, the \`message\` field should state that no current listings were found and suggest the user can check back later or (hypothetically) set up an alert to be notified if the species becomes available.

If listings are found, the \`message\` should be a brief, positive confirmation like "Here are some listings I found for {{{speciesName}}}!".

Return the output as a JSON object matching the defined output schema. Ensure all URLs are valid-looking and the structure is correct.
`,
});

const findPlantFlow = ai.defineFlow(
  {
    name: 'findPlantFlow',
    inputSchema: FindPlantInputSchema,
    outputSchema: FindPlantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return {
        searchResults: [],
        message: `Sorry, I couldn't find any listings for "${input.speciesName}" at the moment. You might want to try again later or (hypothetically) set up an alert.`,
      };
    }
    const uniqueResults = output.searchResults.map((item, index) => {
        const speciesKeywords = input.speciesName.toLowerCase().split(' ').slice(0,2).join(' ');
        return {
            ...item,
            id: item.id || `${item.sourceName.replace(/\s+/g, '-').toLowerCase()}-plant-${index}-${Date.now()}`,
            imageUrl: item.imageUrl || `https://placehold.co/300x200.png`,
            dataAiHint: item.dataAiHint || speciesKeywords
        };
    });

    return { ...output, searchResults: uniqueResults };
  }
);
