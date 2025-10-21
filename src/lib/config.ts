/**
 * Feature flag configuration
 * Toggles between mock and real implementations
 */

// Check if we're using mock data (default true for local development)
export const useMockData = process.env.USE_MOCK_DATA !== 'false';

// Export configuration object
export const config = {
  // Feature flags
  useMockData,
  
  // App configuration
  appName: 'AquaDex',
  appUrl: process.env.NEXTAUTH_URL || 'http://localhost:9002',
  
  // External services
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  ai: {
    // Support both GEMINI_API_KEY and GOOGLE_AI_API_KEY for backwards compatibility
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
  },
  
  // Performance targets
  performance: {
    pageLoadTarget: 3000, // 3s
    apiResponseTarget: 2000, // 2s
    aiAnalysisTarget: 10000, // 10s
    aiAnalysisTimeout: 15000, // 15s
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  // Image configuration
  images: {
    maxUploadSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Marketplace configuration
  marketplace: {
    featuredListingPrice: 9.99,
    maxListingImages: 5,
    defaultShippingRadius: 50, // miles
  },
};

// Helper to check if a service is configured
export function isServiceConfigured(service: 'database' | 'supabase' | 'ai'): boolean {
  if (useMockData) return true;
  
  switch (service) {
    case 'database':
      return !!config.database.url && !config.database.url.includes('your-');
    case 'supabase':
      return !!config.supabase.url && !!config.supabase.anonKey && 
             !config.supabase.url.includes('your-');
    case 'ai':
      return !!config.ai.apiKey && !config.ai.apiKey.includes('your-');
    default:
      return false;
  }
}

// Get database client (mock or real)
export async function getDbClient() {
  if (useMockData) {
    const { mockDb } = await import('./mock/db');
    return mockDb;
  } else {
    const { db } = await import('./db');
    return db;
  }
}

// Get auth client (mock or real)
export async function getAuthClient() {
  if (useMockData) {
    const { mockAuth } = await import('./mock/auth');
    return mockAuth;
  } else {
    const { createClient } = await import('./supabase/server');
    return createClient();
  }
}

// Get AI client (mock or real)
export async function getAiClient() {
  if (useMockData) {
    const { mockAi } = await import('./mock/ai');
    return mockAi;
  } else {
    const { ai } = await import('../ai/genkit');
    return ai;
  }
}
