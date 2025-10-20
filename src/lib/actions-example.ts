/**
 * Example server actions using the feature flag system
 * These work with both mock and real implementations
 */

'use server';

import { getDbClient, getAuthClient, getAiClient } from '@/lib/config';

// Get user's aquariums
export async function getAquariums() {
  const db = await getDbClient();
  const auth = await getAuthClient();
  
  const user = await auth.getCurrentUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const aquariums = await db.aquariums.findMany({
    where: { userId: user.id }
  });
  
  return { aquariums };
}

// Get single aquarium with related data
export async function getAquariumById(aquariumId: string) {
  const db = await getDbClient();
  const auth = await getAuthClient();
  
  const user = await auth.getCurrentUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const aquarium = await db.aquariums.findFirst({
    where: { id: aquariumId }
  });
  
  if (!aquarium) {
    return { error: 'Aquarium not found' };
  }
  
  // Get related data
  const livestock = await db.livestock.findMany({
    where: { aquariumId }
  });
  
  const equipment = await db.equipment.findMany({
    where: { aquariumId }
  });
  
  const waterTests = await db.waterTests.findMany({
    where: { aquariumId },
    orderBy: { testDate: 'desc' },
    limit: 10
  });
  
  const tasks = await db.maintenanceTasks.findMany({
    where: { aquariumId }
  });
  
  return {
    aquarium,
    livestock,
    equipment,
    waterTests,
    tasks,
  };
}

// Create new aquarium
export async function createAquarium(data: {
  name: string;
  sizeGallons: number;
  waterType: 'freshwater' | 'saltwater' | 'brackish';
  location?: string;
  notes?: string;
}) {
  const db = await getDbClient();
  const auth = await getAuthClient();
  
  const user = await auth.getCurrentUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const aquarium = await db.aquariums.insert({
    ...data,
    userId: user.id,
    setupDate: new Date(),
    isActive: true,
    imageUrls: [],
  });
  
  return { aquarium };
}

// Get water test history
export async function getWaterTestHistory(aquariumId: string) {
  const db = await getDbClient();
  const auth = await getAuthClient();
  
  const user = await auth.getCurrentUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const tests = await db.waterTests.findMany({
    where: { aquariumId },
    orderBy: { testDate: 'desc' }
  });
  
  return { tests };
}

// Analyze test strip with AI
export async function analyzeTestStrip(imageUrl: string, aquariumId: string) {
  const ai = await getAiClient();
  const db = await getDbClient();
  const auth = await getAuthClient();
  
  const user = await auth.getCurrentUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Call AI analysis
  const analysis = await ai.analyzeTestStrip(imageUrl);
  
  if (!analysis.success) {
    return { error: 'Analysis failed' };
  }
  
  // Save test results
  const waterTest = await db.waterTests.insert({
    aquariumId,
    userId: user.id,
    testDate: new Date(),
    testMethod: 'strip',
    imageUrl,
    parameters: analysis.parameters,
    aiConfidence: analysis.confidence,
    aiModel: 'gemini-2.0-flash',
    notes: analysis.recommendations.join('\n'),
  });
  
  // If there are warnings, recommend treatments
  if (analysis.warnings.length > 0) {
    const treatment = await ai.recommendTreatment(analysis.parameters);
    
    if (treatment.success && treatment.treatments.length > 0) {
      // Save treatment recommendations
      for (const t of treatment.treatments) {
        await db.treatmentRecommendations?.insert?.({
          waterTestId: waterTest.id,
          productName: t.productName,
          purpose: t.purpose,
          dosage: t.dosage,
          frequency: t.frequency,
          priority: treatment.urgency === 'high' ? 1 : 2,
          purchaseLinks: t.purchaseLinks,
        });
      }
    }
  }
  
  return { 
    waterTest,
    analysis 
  };
}

// Get community questions
export async function getCommunityQuestions(limit: number = 20) {
  const db = await getDbClient();
  
  const questions = await db.questions.findMany({
    orderBy: { lastActivityAt: 'desc' },
    limit
  });
  
  return { questions };
}

// Get marketplace listings
export async function getMarketplaceListings(category?: string) {
  const db = await getDbClient();
  
  const listings = await db.marketplaceListings.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' }
  });
  
  return { listings };
}
