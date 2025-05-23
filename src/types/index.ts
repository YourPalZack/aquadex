
import type { AnalyzeTestStripOutput, RecommendTreatmentProductsOutput } from '@/ai/flows';
import type { LucideProps } from 'lucide-react';
import { Fish, Leaf, Package as PackageIcon, HardHat, HeartHandshake, Gift, type ElementType, ShoppingCart, SearchCheck } from 'lucide-react';


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
  email?: string; 
  avatarUrl?: string;
  dataAiHint?: string;
  isSellerApproved?: boolean; 
  bio?: string; 
  location?: string; 
}

export const mockCurrentUser: UserProfile = {
  id: 'currentUser123',
  name: 'Aqua User',
  email: 'aqua.user@example.com',
  avatarUrl: 'https://placehold.co/100x100.png?text=AU',
  dataAiHint: 'user avatar',
  isSellerApproved: true, // Set to true for demo purposes to see the "Add Listing" button
  bio: 'Passionate aquarist with 5 years of experience in freshwater and planted tanks. Always learning!',
  location: 'Springfield, USA',
};


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

export type IconType = ElementType;


export interface Category {
  name: string;
  slug: string;
  description?: string;
  icon?: IconType; 
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
  id: string; 
  aquariumId: string;
  aquariumName: string;
  type: 'Water Change' | 'Feeding';
  dueDate: Date;
  status: 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming';
  message: string; 
  daysDiff: number; 
}


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
  userId: string; 
  name: string;
  brand?: string;
  variant?: string; 
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
  type?: string; 
  notes?: string;
  amazonLinks?: AmazonLink[];
}

export interface WaterTreatmentProductFormValues {
  name: string;
  brand?: string;
  type?: string;
  notes?: string;
}

export interface FishListing {
  id: string; 
  sourceName: string; 
  listingTitle: string;
  price?: string; 
  url: string; 
  imageUrl?: string; 
  dataAiHint?: string; 
}

export interface FindFishInput {
  speciesName: string;
}

export interface FindFishOutput {
  searchResults: FishListing[];
  message: string; 
}

export interface PlantListing {
  id: string;
  sourceName: string; 
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

export interface TankListing {
  id: string;
  sourceName: string; 
  listingTitle: string;
  price?: string;
  url: string;
  imageUrl?: string;
  dataAiHint?: string;
  capacity?: string; 
  dimensions?: string; 
  brand?: string;
}

export interface FindTankInput {
  tankType?: string; 
  capacity?: string; 
  brand?: string; 
  keywords?: string; 
}

export interface FindTankOutput {
  searchResults: TankListing[];
  message: string;
}

export interface FilterListing {
  id: string;
  sourceName: string; 
  listingTitle: string;
  price?: string;
  url: string;
  imageUrl?: string;
  dataAiHint?: string;
  filterType?: string; 
  flowRate?: string; 
  suitableTankSize?: string; 
  brand?: string;
}

export interface FindFilterInput {
  filterType?: string;
  brand?: string;
  tankSizeGallons?: string; 
  keywords?: string;
}

export interface FindFilterOutput {
  searchResults: FilterListing[];
  message: string;
}

export interface LightingListing {
  id: string;
  sourceName: string;
  listingTitle: string;
  price?: string;
  url: string;
  imageUrl?: string;
  dataAiHint?: string;
  lightType?: string; 
  wattageOrPAR?: string; 
  coverageArea?: string; 
  brand?: string;
  isRecommended?: boolean; 
}

export interface FindLightingInput {
  lightType?: string;
  brand?: string;
  tankSizeOrCoverage?: string; 
  keywords?: string; 
}

export interface FindLightingOutput {
  searchResults: LightingListing[];
  message: string;
}

export const dealCategories = ['Fish Food', 'Filters & Media', 'Lighting', 'Tanks & Stands', 'Water Treatments', 'Decorations & Substrate', 'Heaters & Chillers', 'Other Equipment'] as const;
export type DealCategory = typeof dealCategories[number];

export interface DealItem {
  id: string;
  productName: string;
  originalPrice?: string;
  salePrice: string;
  discountPercentage?: string;
  sourceName: string;
  url: string;
  imageUrl: string; 
  dataAiHint: string; 
  description?: string; 
  category?: DealCategory;
}

export interface FindDealsOutput {
  deals: DealItem[];
  message: string; 
}

export interface MarketplaceCategory {
  slug: string;
  name: string;
  description: string;
  icon?: IconType;
}

export const marketplaceCategoriesData: MarketplaceCategory[] = [
  { slug: 'live-fish', name: 'Live Fish', description: 'Freshwater and saltwater fish.', icon: Fish },
  { slug: 'live-plants', name: 'Live Plants', description: 'Aquatic plants for all tank types.', icon: Leaf },
  { slug: 'new-equipment', name: 'New Equipment', description: 'Brand new filters, lights, tanks, etc.', icon: PackageIcon },
  { slug: 'used-equipment', name: 'Used Equipment', description: 'Pre-owned aquarium gear.', icon: HardHat },
  { slug: 'free-items', name: 'Free Items', description: 'Items being given away by hobbyists.', icon: Gift },
];


export const marketplaceItemConditions = ['new', 'used-like-new', 'used-good', 'used-fair', 'for-parts'] as const;
export type MarketplaceItemCondition = typeof marketplaceItemConditions[number];


export interface MarketplaceListing {
  id: string;
  slug: string; 
  title: string;
  description: string;
  price: string; 
  categorySlug: string;
  sellerId: string; 
  sellerName: string; 
  imageUrl: string; 
  imageHint?: string; 
  condition: MarketplaceItemCondition;
  location?: string; 
  createdAt: Date;
  isFeatured?: boolean;
  tags?: string[];
}

export interface MarketplaceListingFormValues {
  title: string;
  description: string;
  price: string;
  categorySlug: string;
  condition: MarketplaceItemCondition;
  imageUrl: string;
  imageHint?: string;
  location?: string;
  tags?: string[];
}

export interface MarketplaceSeller {
  id: string;
  name: string;
  avatarUrl?: string;
  dataAiHint?: string;
}

export interface SellerApplicationFormValues {
  storeName: string;
  contactEmail: string;
  reasonToSell: string;
  productTypes: string;
}

export type WantedItemStatus = 'pending' | 'approved' | 'rejected' | 'found';

export interface WantedItem {
  id: string;
  title: string;
  description: string;
  categorySlug?: string; 
  userId: string; 
  userName: string; 
  userAvatarUrl?: string;
  userAvatarHint?: string;
  createdAt: Date;
  status: WantedItemStatus; 
  tags?: string[];
}

export interface WantedItemFormValues {
  title: string;
  description: string;
  categorySlug?: string;
  tags?: string[]; // Kept as string[] for display, will be converted from comma-separated input
}
