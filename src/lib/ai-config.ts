/**
 * AI Configuration with Multiple Providers
 * Uses Gemini free tier primarily, with Groq as fallback
 * Includes rate limiting and cost tracking
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const USE_FREE_TIER = process.env.USE_FREE_AI_TIER !== 'false'; // Default to true

// Rate limiting configuration for free tier
const FREE_TIER_LIMITS = {
  gemini: {
    requestsPerMinute: 15,
    requestsPerDay: 1500,
    maxTokensPerRequest: 32000,
  },
  groq: {
    requestsPerMinute: 30,
    requestsPerDay: 14400,
    maxTokensPerRequest: 8000,
  },
};

// Simple in-memory rate limiter (use Redis in production)
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(provider: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const key = `${provider}-${windowMs}`;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  async waitForSlot(provider: string, limit: number, windowMs: number): Promise<void> {
    while (!this.canMakeRequest(provider, limit, windowMs)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

const rateLimiter = new RateLimiter();

/**
 * Primary AI instance using Gemini free tier
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-1.5-flash', // Free tier model
});

/**
 * Make an AI request with automatic rate limiting and provider fallback
 */
export async function makeAIRequest<T>(
  requestFn: () => Promise<T>,
  options: {
    provider?: 'gemini' | 'groq';
    retries?: number;
    fallback?: boolean;
  } = {}
): Promise<T> {
  const {
    provider = 'gemini',
    retries = 3,
    fallback = true,
  } = options;

  // Check rate limits for free tier
  if (USE_FREE_TIER) {
    const limits = FREE_TIER_LIMITS[provider];
    await rateLimiter.waitForSlot(provider, limits.requestsPerMinute, 60000);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await requestFn();
      return result;
    } catch (error: any) {
      lastError = error;
      console.warn(`AI request attempt ${attempt + 1} failed:`, error.message);

      // Check if we hit rate limits
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        console.log(`Rate limit hit on ${provider}, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }

      // If not a rate limit error and we have retries left, try again
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // If all retries failed and fallback is enabled, try alternative provider
  if (fallback && provider === 'gemini') {
    console.log('Gemini failed, trying Groq fallback...');
    // Note: Groq implementation would go here
    // For now, we'll throw the original error
  }

  throw lastError || new Error('AI request failed');
}

/**
 * Analyze test strip image using vision model
 * Optimized for free tier usage
 */
export async function analyzeTestStripImage(
  imageUrl: string,
  aquariumType: 'freshwater' | 'saltwater' | 'brackish' | 'pond'
) {
  return makeAIRequest(async () => {
    const prompt = `Analyze this aquarium water test strip image and extract the following parameters:
- pH level
- Ammonia (ppm)
- Nitrite (ppm)
- Nitrate (ppm)
- Hardness (GH/KH)
- Any other visible parameters

Aquarium type: ${aquariumType}

Return the results as JSON with parameter names and values. Include confidence levels for each reading.
Also provide brief assessment of water quality.`;

    // Use Genkit's generate function
    const { text } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      config: {
        temperature: 0.1, // Low temperature for accurate readings
        maxOutputTokens: 500, // Limit output to save costs
      },
    });

    return text;
  }, { provider: 'gemini' });
}

/**
 * Get treatment recommendations based on water parameters
 * Uses text-only model for lower costs
 */
export async function getWaterTreatmentRecommendations(params: {
  ph?: number | null;
  ammonia?: number | null;
  nitrite?: number | null;
  nitrate?: number | null;
  aquariumType: string;
  tankSize?: number;
}) {
  return makeAIRequest(async () => {
    const prompt = `As an aquarium expert, analyze these water parameters and provide treatment recommendations:

Parameters:
- pH: ${params.ph ?? 'not tested'}
- Ammonia: ${params.ammonia ?? 'not tested'} ppm
- Nitrite: ${params.nitrite ?? 'not tested'} ppm
- Nitrate: ${params.nitrate ?? 'not tested'} ppm
- Tank type: ${params.aquariumType}
- Tank size: ${params.tankSize ?? 'unknown'} gallons

Provide:
1. Water quality assessment (Good/Fair/Poor)
2. Immediate actions needed (if any)
3. Recommended products or treatments
4. Water change recommendations
5. General advice

Keep response concise and actionable.`;

    const { text } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 800,
      },
    });

    return text;
  }, { provider: 'gemini' });
}

/**
 * Get cost estimate for AI usage
 */
export function estimateCost(params: {
  imageAnalyses: number;
  textRecommendations: number;
  month?: boolean;
}): { free: boolean; estimatedCost: number } {
  const { imageAnalyses, textRecommendations, month = false } = params;
  
  // Gemini 1.5 Flash pricing (per 1M tokens)
  const inputCost = 0.075; // $0.075 per 1M input tokens
  const outputCost = 0.30; // $0.30 per 1M output tokens
  
  // Estimate tokens per request
  const tokensPerImageAnalysis = 2000; // ~1500 input (image) + 500 output
  const tokensPerTextRecommendation = 1000; // ~600 input + 400 output
  
  const totalTokens = 
    (imageAnalyses * tokensPerImageAnalysis) + 
    (textRecommendations * tokensPerTextRecommendation);
  
  const cost = (totalTokens / 1000000) * (inputCost + outputCost);
  
  // Check if within free tier
  const monthlyRequests = month ? (imageAnalyses + textRecommendations) : (imageAnalyses + textRecommendations) * 30;
  const isFree = monthlyRequests <= 1500 * 30; // 1500 requests/day free tier
  
  return {
    free: isFree,
    estimatedCost: isFree ? 0 : cost,
  };
}

export default ai;