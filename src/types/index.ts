
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
export type SourceWaterType = 'tap' | 'ro' | 'premixed_saltwater';

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
  foodDetails?: string; 
  nextFeedingReminder?: Date;
  sourceWaterType?: SourceWaterType;
  sourceWaterParameters?: string;
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

export interface ReminderItem {
  id: string; // e.g., aquariumId-waterchange
  aquariumId: string;
  aquariumName: string;
  type: 'Water Change' | 'Feeding';
  dueDate: Date;
  status: 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming';
  message: string; // Full descriptive message, e.g., "Living Room Reef: Water Change Overdue by 3 days"
  daysDiff: number; // e.g., -3 for 3 days overdue, 0 for today, 2 for due in 2 days
}


// Re-export AI flow types for easier access if needed
export type { AnalyzeTestStripInput, AnalyzeTestStripOutput } from '@/ai/flows';
export type { RecommendTreatmentProductsInput, RecommendTreatmentProductsOutput } from '@/ai/flows/recommend-treatment-products';
export type { GetFoodPurchaseLinksInput, GetFoodPurchaseLinksOutput } from '@/ai/flows/get-food-purchase-links';


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

export interface WaterTreatmentProduct {
  id: string;
  userId: string;
  name: string;
  brand?: string;
  type?: string; // e.g., "Dechlorinator", "Beneficial Bacteria", "pH Up"
  notes?: string;
  amazonLinks?: AmazonLink[];
}

export interface WaterTreatmentProductFormValues {
  name: string;
  brand?: string;
  type?: string;
  notes?: string;
}

// Fish Finder Types
export interface FishListing {
  id: string; // Added for unique key in React lists
  sourceName: string; // e.g., "Ebay", "AquaBid", "Dan's Fish", "Simulated Trusted Source"
  listingTitle: string;
  price?: string; // e.g., "$15.99", "Bidding starts at $5"
  url: string; // Direct link or search link
  imageUrl?: string; // Optional image for the listing
  dataAiHint?: string; // For placeholder image
}

export interface FindFishInput {
  speciesName: string;
}

export interface FindFishOutput {
  searchResults: FishListing[];
  message: string; // e.g., "Here are some listings...", "No current listings found."
}

// Plant Finder Types
export interface PlantListing {
  id: string;
  sourceName: string; // e.g., "Ebay", "Etsy", "Amazon", "Aquarium Co-Op"
  listingTitle: string;
  price?: string;
  url: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export interface FindPlantInput {
  speciesName: string;
}

export interface FindPlantOutput {
  searchResults: PlantListing[];
  message: string;
}

// Tank Finder Types
export interface TankListing {
  id: string;
  sourceName: string; // e.g., "Amazon", "Petco", "AquaWorld Superstore"
  listingTitle: string;
  price?: string;
  url: string;
  imageUrl?: string;
  dataAiHint?: string;
  capacity?: string; // e.g., "20 Gallons", "75 Liters"
  dimensions?: string; // e.g., "24x12x16 inches"
  brand?: string;
}

export interface FindTankInput {
  tankType?: string; // e.g., "freshwater", "rimless", "nano"
  capacity?: string; // e.g., "10 gallons", "approx 50L"
  brand?: string; // e.g., "Waterbox", "Fluval", "UNS"
  keywords?: string; // General keywords if specific fields are not enough
}

export interface FindTankOutput {
  searchResults: TankListing[];
  message: string;
}

// Filter Finder Types
export interface FilterListing {
  id: string;
  sourceName: string; // e.g., "Amazon", "AquaForest", "BulkReefSupply"
  listingTitle: string;
  price?: string;
  url: string;
  imageUrl?: string;
  dataAiHint?: string;
  filterType?: string; // e.g., "Canister", "HOB", "Sponge", "Internal"
  flowRate?: string; // e.g., "300 GPH", "1000 L/H"
  suitableTankSize?: string; // e.g., "Up to 50 Gallons", "100-200 Liters"
  brand?: string;
}

export interface FindFilterInput {
  filterType?: string;
  brand?: string;
  tankSizeGallons?: string; // e.g. "20", "50-75"
  keywords?: string;
}

export interface FindFilterOutput {
  searchResults: FilterListing[];
  message: string;
}
