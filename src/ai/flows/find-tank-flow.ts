
'use server';
/**
 * @fileOverview A Genkit flow to find listings for aquariums/tanks from various sources.
 *
 * - findTank - A function that handles the tank finding process.
 * - FindTankInput - The input type for the findTank function.
 * - FindTankOutput - The return type for the findTank function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FindTankInput, FindTankOutput, TankListing } from '@/types';

// Define Zod schemas based on the TypeScript interfaces
const TankListingSchema = z.object({
  id: z.string().describe("A unique ID for this listing item (can be generated, e.g., sourceName-itemId)."),
  sourceName: z.string().describe("The name of the source where the listing was found (e.g., 'Amazon', 'Petco', 'AquaWorld Superstore', 'Innovative Aquatics')."),
  listingTitle: z.string().describe("The title or description of the aquarium/tank listing."),
  price: z.string().optional().describe("The price of the listing, if available (e.g., '$129.99', 'From $75.00')."),
  url: z.string().url().describe("The direct URL to the listing or a search URL for the tank on the source website."),
  imageUrl: z.string().url().optional().describe("An optional image URL for the listing. Use https://placehold.co/400x300.png format for placeholders if no real image can be generated."),
  dataAiHint: z.string().optional().describe("If using a placeholder image, provide one or two keywords for Unsplash search (e.g., 'aquarium tank', 'fish tank'). Max two words."),
  capacity: z.string().optional().describe("The capacity of the tank (e.g., '20 Gallons', '75 Liters')."),
  dimensions: z.string().optional().describe("The dimensions of the tank (e.g., '24x12x16 inches', '60x30x40 cm')."),
  brand: z.string().optional().describe("The brand of the tank, if specified or identifiable (e.g., 'Waterbox', 'Fluval', 'Aqueon').")
});

const FindTankInputSchema = z.object({
  tankType: z.string().optional().describe('The general type of tank (e.g., "freshwater starter kit", "rimless reef tank", "nano cube").'),
  capacity: z.string().optional().describe('The desired capacity of the tank (e.g., "10 gallons", "around 50 liters", "20-30 US gal").'),
  brand: z.string().optional().describe('The preferred brand of the tank (e.g., "Waterbox", "Fluval", "UNS").'),
  keywords: z.string().optional().describe('Any other specific keywords, like "peninsula style", "with built-in filter", "low iron glass".'),
});

const FindTankOutputSchema = z.object({
  searchResults: z.array(TankListingSchema).describe('A list of found listings for the specified tank. If no listings are found, this array will be empty.'),
  message: z.string().describe("A summary message about the search results. If no results, explain that and mention that the user could (hypothetically) set an alert. If results are found, provide a brief positive message."),
});

export async function findTank(input: FindTankInput): Promise<FindTankOutput> {
  return findTankFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findTankPrompt',
  input: { schema: FindTankInputSchema },
  output: { schema: FindTankOutputSchema },
  prompt: `You are a helpful Aquarium Tank Finder assistant. The user is looking for a specific type/size/brand of aquarium tank.

Your task is to simulate searching the following sources for listings matching the user's criteria:
1.  Amazon (amazon.com)
2.  Petco (petco.com) - if relevant for the type of tank
3.  Invent one or two other plausible-sounding "trusted online aquarium supply stores" for this simulation (e.g., "AquaWorld Superstore", "Crystal Clear Tanks", "ReefSupply Direct").

For each listing you "find" (simulate finding), provide:
-   A unique \`id\` for the listing (e.g., "amazon-tank-123", "petco-tank-xyz").
-   The \`sourceName\`.
-   A realistic \`listingTitle\` for the tank based on the criteria.
-   An estimated \`price\` if it makes sense.
-   A \`url\`. This should be a plausible-looking URL. For real sites, construct a search URL. For invented stores, create a fictional product page URL.
    (e.g., Amazon: https://www.amazon.com/s?k={{{brand}}}+{{{capacity}}}+{{{tankType}}}+aquarium, Petco: https://www.petco.com/shop/en/petcostore/category/fish/fish-aquariums-kits#gb_brand_facet={{{brand}}}&Tank_Capacity_facet={{{capacity}}} )
-   An optional \`imageUrl\`. If you include one, use a placeholder image from \`https://placehold.co/400x300.png\`.
-   If using a placeholder image, include a relevant \`dataAiHint\` (e.g., "glass aquarium", "nano tank", "{{{tankType}}} {{{brand}}}"). Max two words.
-   The \`capacity\` of the tank (e.g., "10 Gallons", "75L"). Try to match user input if provided, otherwise make a reasonable assumption.
-   Plausible \`dimensions\` for the tank if possible (e.g., "20x10x12 inches").
-   The \`brand\` of the tank if specified by user or commonly associated with the type.

User's Search Criteria:
{{#if tankType}}Tank Type: {{{tankType}}}{{/if}}
{{#if capacity}}Capacity: {{{capacity}}}{{/if}}
{{#if brand}}Brand: {{{brand}}}{{/if}}
{{#if keywords}}Keywords: {{{keywords}}}{{/if}}

If the user provides no criteria, you can respond with a message asking them to specify what they are looking for, and an empty searchResults array.
If criteria are provided, return at least 2-3 listings if possible, distributed among the sources. If you simulate finding no listings on a particular source, do not include an entry for it in searchResults.

If no listings are found on ANY source for the given criteria, the \`searchResults\` array should be empty. In this case, the \`message\` field should state that no current listings were found and suggest the user can check back later or (hypothetically) set up an alert.

If listings are found, the \`message\` should be a brief, positive confirmation like "Here are some tank listings I found matching your criteria!".

Return the output as a JSON object matching the defined output schema. Ensure all URLs are valid-looking and the structure is correct.
`,
});

const findTankFlow = ai.defineFlow(
  {
    name: 'findTankFlow',
    inputSchema: FindTankInputSchema,
    outputSchema: FindTankOutputSchema,
  },
  async (input) => {
    // Handle case where no input is provided at all
    if (!input.tankType && !input.capacity && !input.brand && !input.keywords) {
      return {
        searchResults: [],
        message: "Please specify the type, capacity, brand, or keywords for the tank you're looking for.",
      };
    }

    const { output } = await prompt(input);
    if (!output) {
      return {
        searchResults: [],
        message: `Sorry, I couldn't find any tanks matching your criteria at the moment. You might want to try again later or (hypothetically) set up an alert.`,
      };
    }
    const uniqueResults = output.searchResults.map((item, index) => {
        const hintKeywords = (input.tankType || input.brand || 'aquarium tank').toLowerCase().split(' ').slice(0,2).join(' ');
        return {
            ...item,
            id: item.id || `${item.sourceName.replace(/\s+/g, '-').toLowerCase()}-tank-${index}-${Date.now()}`,
            imageUrl: item.imageUrl || `https://placehold.co/400x300.png`,
            dataAiHint: item.dataAiHint || hintKeywords,
        };
    });

    return { ...output, searchResults: uniqueResults };
  }
);

