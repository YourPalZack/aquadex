import type { AnalyzeTestStripOutput, RecommendTreatmentProductsOutput } from '@/ai/flows';

export interface TestResult {
  id: string;
  userId: string; // Or however you identify users
  timestamp: Date;
  imageUrl?: string; // Optional: URL of the uploaded test strip image
  parameters: AnalyzeTestStripOutput['waterParameters'];
  recommendations?: RecommendTreatmentProductsOutput;
  notes?: string;
}

export interface Aquarium {
  id: string;
  userId: string;
  name: string;
  volumeGallons?: number;
  type: 'freshwater' | 'saltwater' | 'brackish' | 'reef'; // Example types
  lastWaterChange?: Date;
  nextWaterChangeReminder?: Date;
  notes?: string;
}

// Re-export AI flow types for easier access if needed
export type { AnalyzeTestStripInput, AnalyzeTestStripOutput } from '@/ai/flows';
export type { RecommendTreatmentProductsInput, RecommendTreatmentProducts