
'use server';
/**
 * @fileOverview A Genkit flow to find listings for aquatic species from various sources.
 *
 * - findFish - A function that handles the fish finding process.
 * - FindFishInput - The input type for the findFish function.
 * - FindFishOutput - The return type for the findFish function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FindFishInput, FindFishOutput, FishListing } from '@/types'; // Assuming these types are defined in @/types

// Define Zod schemas based on the TypeScript interfaces
const FishListingSchema = z.object({
  id: z.string().describe("A unique ID for this listing item (can be generated, e.g., sourceName-itemId)."),
  sourceName: z.string().describe("The name of the source where the listing was found (e.g., 'Ebay', 'AquaBid', 'Dan\\'s Fish', 'AquaRealm Exotics')."),
  listingTitle: z.string().describe("The title or description of the fish/invertebrate listing."),
  price: z.string().optional().describe("The price of the listing, if available (e.g., '$19.99', 'Bidding at $10.50')."),
  url: z.string().url().describe("The direct URL to the listing or a search URL for the species on the source website."),
  imageUrl: z.string().url().optional().describe("An optional image URL for the listing. Use https://placehold.co/300x200.png format for placeholders if no real image can be generated."),
  dataAiHint: z.string().optional().describe("If using a placeholder image, provide one or two keywords for Unsplash search (e.g., 'aquarium fish'). Max two words.")
});

const FindFishInputSchema = z.object({
  speciesName: z.string().describe('The scientific or common name of the fish or invertebrate species to search for.'),
});

const FindFishOutputSchema = z.object({
  searchResults: z.array(FishListingSchema).describe('A list of found listings for the specified species. If no listings are found, this array will be empty.'),
  message: z.string().describe("A summary message about the search results. If no results, explain that and mention that the user could (hypothetically) set an alert. If results are found, provide a brief positive message."),
});

export async function findFish(input: FindFishInput): Promise<FindFishOutput> {
  return findFishFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findFishPrompt',
  input: { schema: FindFishInputSchema },
  output: { schema: FindFishOutputSchema },
  prompt: `You are a helpful Fish Finder assistant. The user is looking for a specific aquatic species.

Your task is to simulate searching the following sources for listings of the specified species:
1.  Ebay (ebay.com)
2.  AquaBid (aquabid.com)
3.  Dan's Fish (dansfish.com)
4.  Invent one or two other plausible-sounding "trusted online fish stores" for this simulation (e.g., "AquaRealm Exotics", "CoralKingdom Direct", "DeepSea Wonders").

For each listing you "find" (simulate finding), provide:
-   A unique \`id\` for the listing (e.g., "ebay-123", "aquabid-xyz").
-   The \`sourceName\`.
-   A realistic \`listingTitle\` for the species.
-   An estimated \`price\` if it makes sense (e.g., "$15.99", "Bidding starts at $5.00").
-   A \`url\`. This should be a plausible-looking URL. For real sites like eBay, AquaBid, Dan's Fish, construct a search URL (e.g., https://www.ebay.com/sch/i.html?_nkw={{{speciesName}}}, https://www.aquabid.com/cgi-bin/auction/search.cgi?query={{{speciesName}}}, https://dansfish.com/search?type=product&q={{{speciesName}}}). For your invented stores, you can create a fictional product page URL.
-   An optional \`imageUrl\`. If you include one, use a placeholder image from \`https://placehold.co/300x200.png?text=Species+Image\`. You can vary the text parameter.
-   If using a placeholder image, include a relevant \`dataAiHint\` (e.g., "betta fish", "shrimp aquarium").

Species to search for: {{{speciesName}}}

Return at least 2-3 listings if possible, distributed among the sources. If you simulate finding no listings on a particular source, do not include an entry for it in searchResults.

If no listings are found on ANY source for "{{{speciesName}}}", the \`searchResults\` array should be empty. In this case, the \`message\` field should state that no current listings were found and suggest the user can check back later or (hypothetically) set up an alert to be notified if the species becomes available.

If listings are found, the \`message\` should be a brief, positive confirmation like "Here are some listings I found for {{{speciesName}}}!".

Return the output as a JSON object matching the defined output schema. Ensure all URLs are valid-looking and the structure is correct.
`,
});

const findFishFlow = ai.defineFlow(
  {
    name: 'findFishFlow',
    inputSchema: FindFishInputSchema,
    outputSchema: FindFishOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      // Fallback in case the model doesn't return anything or returns a malformed empty response
      return {
        searchResults: [],
        message: `Sorry, I couldn't find any listings for "${input.speciesName}" at the moment. You might want to try again later or (hypothetically) set up an alert.`,
      };
    }
    // Ensure IDs are unique if model doesn't always provide them or provides duplicates
    const uniqueResults = output.searchResults.map((item, index) => ({
        ...item,
        id: item.id || `${item.sourceName.replace(/\s+/g, '-').toLowerCase()}-${index}-${Date.now()}`,
        // Ensure placeholder images if real ones are not generated by the model
        imageUrl: item.imageUrl || (item.listingTitle ? `https://placehold.co/300x200.png?text=${encodeURIComponent(item.listingTitle.substring(0,20))}` : `https://placehold.co/300x200.png?text=Fish`),
        dataAiHint: item.dataAiHint || input.speciesName.toLowerCase().split(' ').slice(0,2).join(' ')
    }));

    return { ...output, searchResults: uniqueResults };
  }
);

