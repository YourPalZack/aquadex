
'use server';
/**
 * @fileOverview A Genkit flow to find simulated deals on aquarium products.
 *
 * - findAquariumDeals - A function that handles finding simulated deals.
 * - FindDealsOutput - The return type for the findAquariumDeals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FindDealsOutput, DealItem } from '@/types';

// Define Zod schemas based on the TypeScript interfaces
const DealItemSchema = z.object({
  id: z.string().describe("A unique ID for this deal item (e.g., 'amazon-deal-123')."),
  productName: z.string().describe("The name of the discounted product."),
  originalPrice: z.string().optional().describe("The simulated original price (e.g., '$49.99')."),
  salePrice: z.string().describe("The simulated sale price (e.g., '$39.99')."),
  discountPercentage: z.string().optional().describe("The calculated or estimated discount percentage (e.g., '20% off')."),
  sourceName: z.string().describe("The name of the source where the deal was found (e.g., 'Amazon', 'AquaScape Deals Co.', 'ReefBargains Online')."),
  url: z.string().describe("The direct URL to the product listing or a search URL on the source website. For Amazon, use 'https://www.amazon.com/s?k=ENCODED_PRODUCT_NAME&tag=YOUR_AMAZON_TAG-20' format, replacing ENCODED_PRODUCT_NAME and ensuring the placeholder tag is included."),
  imageUrl: z.string().describe("An image URL for the product. MUST use `https://placehold.co/300x200.png` format."),
  dataAiHint: z.string().describe("One or two keywords for Unsplash search if using a placeholder image (e.g., 'aquarium filter', 'fish food'). Max two words."),
  description: z.string().optional().describe("A brief description of the product or why it's a good deal.")
});

const FindDealsOutputSchema = z.object({
  deals: z.array(DealItemSchema).describe('A list of 3-5 simulated deals for popular aquarium products. If no deals are conceptualized, this array can be empty, though try to always find some.'),
  message: z.string().describe("A summary message about the deals, e.g., 'Here are today's top simulated deals for aquarists!' or 'Fresh deals checked daily - here's what we found!'."),
});

export async function findAquariumDeals(): Promise<FindDealsOutput> {
  // This flow doesn't take input, it just generates deals.
  return findAquariumDealsFlow({});
}

const prompt = ai.definePrompt({
  name: 'findAquariumDealsPrompt',
  output: { schema: FindDealsOutputSchema },
  prompt: `You are an assistant that finds the best (simulated) deals on aquarium supplies.

Your task is to generate a list of 3-5 popular aquarium products that are currently "on sale". These are simulated deals for demonstration purposes.

For each product, provide:
-   A unique \`id\` for the deal item (e.g., "amazon-heater-deal-001", "aquascapeco-light-deal-002").
-   A realistic \`productName\` (e.g., "Eheim Jager Aquarium Heater 100W", "Fluval Plant 3.0 LED Light 24-34in", "Seachem Prime 500ml").
-   A simulated \`originalPrice\` (e.g., "$29.99", "$129.00").
-   A simulated \`salePrice\` that is lower than the original price (e.g., "$22.50", "$99.99").
-   Optionally, calculate and include a \`discountPercentage\` based on the original and sale prices (e.g., "25% off").
-   The \`sourceName\`. One or two should be "Amazon". Invent 1-2 other plausible-sounding "trusted online aquarium stores" (e.g., "AquaScape Deals Co.", "ReefBargains Online", "PetSupply Savers").
-   A plausible \`url\`.
    -   For Amazon listings, construct a search URL like: \`https://www.amazon.com/s?k=REPLACE+WITH+URL+ENCODED+PRODUCT+NAME&tag=YOUR_AMAZON_TAG-20\` (ensure the YOUR_AMAZON_TAG-20 part is present).
    -   For invented stores, create a fictional product page URL (e.g., \`https://aquascapedeals.co/product/fluval-plant-led\`).
-   An \`imageUrl\`. **You MUST use the format \`https://placehold.co/300x200.png\` for all images.**
-   A \`dataAiHint\` (one or two keywords, max two words) relevant to the product for the placeholder image (e.g., "aquarium heater", "LED light", "water conditioner").
-   A brief \`description\` of the product or why it's a good deal (e.g., "Popular and reliable heater, great for tanks up to 30 gallons.", "Save big on this top-rated LED light for planted tanks.").

Try to vary the types of products (e.g., equipment, food, conditioners).

Finally, provide a general \`message\` for the user, like "Here are today's top simulated deals for aquarists!" or "Fresh deals checked daily - here's what we found!".

Return the output as a JSON object matching the defined output schema. Ensure all URLs are valid-looking, image URLs are exactly \`https://placehold.co/300x200.png\`, and the structure is correct.
`,
});

const findAquariumDealsFlow = ai.defineFlow(
  {
    name: 'findAquariumDealsFlow',
    // No input schema specified as it's a general deal finder for now
    outputSchema: FindDealsOutputSchema,
  },
  async () => { // No input parameter needed for this specific flow
    const { output } = await prompt({}); // Call prompt without specific input
    if (!output) {
      return {
        deals: [],
        message: "Sorry, I couldn't find any special deals right now. Please check back later!",
      };
    }
    // Ensure IDs and image details are correctly set if the model misses them
    const processedDeals = output.deals.map((item, index) => ({
      ...item,
      id: item.id || `${item.sourceName.replace(/\s+/g, '-').toLowerCase()}-deal-${index}-${Date.now()}`,
      imageUrl: `https://placehold.co/300x200.png`, // Enforce placeholder format
      dataAiHint: item.dataAiHint || item.productName.toLowerCase().split(' ').slice(0,2).join(' '),
    }));

    return { ...output, deals: processedDeals };
  }
);

