import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Using Gemini 1.5 Flash for free tier (1M requests/month)
// See docs/AI_SETUP_FREE.md for details on rate limits and costs
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
