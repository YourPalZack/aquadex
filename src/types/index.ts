
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

export type AquariumType = 'freshwater' | 'saltwater' | 'brackish' | 'reef';

export interface Aquarium {
  id: string;
  userId: string;
  name: string;
  volumeGallons?: number;
  type: AquariumType;
  lastWaterChange?: Date;
  nextWaterChangeReminder?: Date;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string; 
}

export interface Answer {
  id: string;
  author: UserProfile;
  content: string;
  createdAt: Date;
  upvotes?: number;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  author: UserProfile;
  createdAt: Date;
  tags: string[];
  answers: Answer[];
}

// Re-export AI flow types for easier access if needed
export type { AnalyzeTestStripInput, AnalyzeTestStripOutput } from '@/ai/flows';
export type { RecommendTreatmentProductsInput, RecommendTreatmentProductsOutput } from '@/ai/flows/recommend-treatment-products'; // Corrected path
