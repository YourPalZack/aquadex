
import { config } from 'dotenv';
config();

import '@/ai/flows/recommend-treatment-products.ts';
import '@/ai/flows/suggest-prompt-from-water-type.ts';
import '@/ai/flows/analyze-test-strip.ts';
import '@/ai/flows/get-food-purchase-links.ts';
import '@/ai/flows/find-fish-flow.ts';
import '@/ai/flows/find-plant-flow.ts';
import '@/ai/flows/find-tank-flow.ts';
import '@/ai/flows/find-filter-flow.ts'; 
import '@/ai/flows/find-lighting-flow.ts'; // Added new lighting flow

