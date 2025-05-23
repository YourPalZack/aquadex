
import { config } from 'dotenv';
config();

import '@/ai/flows/recommend-treatment-products.ts';
import '@/ai/flows/suggest-prompt-from-water-type.ts';
import '@/ai/flows/analyze-test-strip.ts';
import '@/ai/flows/get-food-purchase-links.ts';
