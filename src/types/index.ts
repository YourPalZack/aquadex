
import type { AnalyzeTestStripOutput, RecommendTreatmentProductsOutput } from '@/ai/flows';

export interface TestResult {
  id: string;
  userId: string; // Or however you identify users
  timestamp: Date;
  imageUrl?: string; // Optional: URL of the uploaded test strip image
  parameters: AnalyzeTestStripOutput['waterParameters'];
  recommendations?: RecommendTreatmentProductsOutput;
  notes?: string;
  aquariumId?: string; // Added for linking tests to aquariums
}

export type AquariumType = 'freshwater' | 'saltwater' | 'brackish' | 'reef';

export interface Aquarium {
  id: string;
  userId: string;
  name: string;
  volumeGallons?: number;
  type: AquariumType;
  imageUrl?: string;
  lastWaterChange?: Date;
  nextWaterChangeReminder?: Date;
  notes?: string;
  fishSpecies?: string; 
  fishCount?: number;
  co2Injection?: boolean;
  filterDetails?: string;
  foodDetails?: string; // New field for food type/brand
  nextFeedingReminder?: Date; // New field for feeding reminder
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  dataAiHint?: string;
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
  category: string; // Category slug
  answers: Answer[];
}

export interface Category {
  name: string;
  slug: string;
  description?: string;
}

export const questionCategories: Category[] = [
  { name: 'Freshwater', slug: 'freshwater', description: 'Discussions about freshwater aquariums, fish, and plants.' },
  { name: 'Saltwater', slug: 'saltwater', description: 'All about saltwater tanks, marine fish, and invertebrates.' },
  { name: 'Reef Tanks', slug: 'reef-tanks', description: 'Focus on coral care, reef ecosystems, and advanced setups.' },
  { name: 'Fish Health', slug: 'fish-health', description: 'Diagnosing and treating fish diseases and health issues.' },
  { name: 'Aquascaping & Plants', slug: 'aquascaping-plants', description: 'The art of aquarium design and live plant care.' },
  { name: 'Equipment & Setup', slug: 'equipment-setup', description: 'Filters, lighting, heaters, and setting up new tanks.' },
  { name: 'General Discussion', slug: 'general-discussion', description: 'For everything else related to the aquarium hobby.' },
];


// Re-export AI flow types for easier access if needed
export type { AnalyzeTestStripInput, AnalyzeTestStripOutput } from '@/ai/flows';
export type { RecommendTreatmentProductsInput, RecommendTreatmentProductsOutput } from '@/ai/flows/recommend-treatment-products';

export type { AquariumFormValues } from '@/components/aquariums/AquariumForm';
export type { QuestionFormValues } from '@/components/qa/QuestionForm';


export interface AmazonLink {
  storeName: string;
  url: string;
}
export interface FishFood {
  id: string;
  userId: string; // For future user scoping
  name: string;
  brand?: string;
  variant?: string; // e.g., "Medium Pellet", "50g", "Color Enhancing"
  notes?: string;
  amazonLinks?: AmazonLink[];
}

export interface FishFoodFormValues {
  name: string;
  brand?: string;
  variant?: string;
  notes?: string;
}
