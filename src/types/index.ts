
import type { AnalyzeTestStripOutput, RecommendTreatmentProductsOutput } from '@/ai/flows';
import type { LucideProps } from 'lucide-react';
import { 
    Fish, 
    Leaf, 
    Package as PackageIcon, 
    HardHat, 
    HeartHandshake, 
    Gift, 
    MessageSquare,
    ShoppingCart, 
    SearchCheck, 
    Store as StoreIcon, 
    Star 
} from 'lucide-react';
import { subDays, addDays } from 'date-fns';
import type { ElementType } from 'react';


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

// Moved from /src/app/aquariums/page.tsx
const today = new Date();
export const mockAquariumsData: Aquarium[] = [
  {
    id: 'aqua1',
    userId: 'user123',
    name: 'Living Room Reef',
    volumeGallons: 75,
    type: 'saltwater',
    imageUrl: 'https://placehold.co/600x400.png',
    lastWaterChange: subDays(today, 14), 
    nextWaterChangeReminder: subDays(today, 3), 
    notes: 'Keeping an eye on SPS coral growth. Clownfish are active.',
    fishSpecies: 'Clownfish, Royal Gramma, Yellow Tang',
    fishCount: 5,
    co2Injection: false,
    filterDetails: 'Sump with Protein Skimmer & Refugium',
    foodDetails: 'NLS Pellets, Rods Food, Mysis Shrimp',
    nextFeedingReminder: subDays(today, 1), 
    sourceWaterType: 'premixed_saltwater',
    sourceWaterParameters: 'Using Tropic Marin Pro Reef salt mix.',
  },
  {
    id: 'aqua2',
    userId: 'user123',
    name: 'Betta Paradise',
    volumeGallons: 5,
    type: 'freshwater',
    imageUrl: 'https://placehold.co/600x400.png',
    lastWaterChange: subDays(today, 5), 
    nextWaterChangeReminder: today, 
    notes: 'Betta seems happy. Plants are growing well. Added some shrimp.',
    fishSpecies: 'Betta Splendens, Amano Shrimp',
    fishCount: 6, 
    co2Injection: false,
    filterDetails: 'Small HOB Filter',
    foodDetails: 'Betta Pellets, Bloodworms (treat)',
    nextFeedingReminder: addDays(today, 1), 
    sourceWaterType: 'tap',
    sourceWaterParameters: 'Tap water treated with Seachem Prime. pH: 7.2, GH: 5 dGH',
  },
  {
    id: 'aqua3',
    userId: 'user123',
    name: 'Planted Community',
    volumeGallons: 29,
    type: 'freshwater',
    imageUrl: 'https://placehold.co/600x400.png',
    lastWaterChange: subDays(today, 2), 
    nextWaterChangeReminder: addDays(today, 2), 
    notes: 'New guppies added last week. CO2 running smoothly.',
    fishSpecies: 'Guppy, Neon Tetra, Corydora, Otocinclus',
    fishCount: 20,
    co2Injection: true,
    filterDetails: 'Canister Filter - Eheim Classic 250',
    foodDetails: 'Community Flakes, Algae Wafers',
    nextFeedingReminder: addDays(today, 7), 
    sourceWaterType: 'ro',
    sourceWaterParameters: 'RO water remineralized with Seachem Equilibrium.',
  },
  {
    id: 'aqua4',
    userId: 'user123',
    name: 'Office Nano Reef',
    volumeGallons: 10,
    type: 'reef',
    imageUrl: 'https://placehold.co/600x400.png',
    lastWaterChange: subDays(today, 10),
    nextWaterChangeReminder: addDays(today, 4), 
    notes: 'Small zoa garden and a single ricordea. Skimmer running fine.',
    fishSpecies: 'Tailspot Blenny, Sexy Shrimp',
    fishCount: 3,
    co2Injection: false,
    filterDetails: 'HOB Skimmer, Small Powerhead',
    foodDetails: 'Reef Roids, Small Pellets',
    nextFeedingReminder: addDays(today, 0), 
    sourceWaterType: 'ro',
  },
];


export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  dataAiHint?: string;
  isSellerApproved?: boolean;
  bio?: string;
  location?: string;
  isFeatured?: boolean;
}

export const mockCurrentUser: UserProfile = {
  id: 'currentUser123',
  name: 'Aqua User',
  email: 'aqua.user@example.com',
  avatarUrl: 'https://placehold.co/100x100.png?text=AU',
  dataAiHint: 'user avatar',
  isSellerApproved: true,
  bio: 'Passionate aquarist with 5 years of experience in freshwater and planted tanks. Always learning!',
  location: 'Springfield, USA',
  isFeatured: true,
};

export const mockUsers: UserProfile[] = [
  { id: 'user1', name: 'Alice Aqua', avatarUrl: 'https://placehold.co/40x40.png?text=AA', dataAiHint: 'female avatar', isFeatured: true, bio: 'Specializing in rare Anubias and Bucephalandra.' },
  { id: 'user2', name: 'Bob Fishman', avatarUrl: 'https://placehold.co/40x40.png?text=BF', dataAiHint: 'male avatar', bio: 'Breeder of high-quality Angelfish and Discus.' },
  { id: 'user3', name: 'Charlie Coral', avatarUrl: 'https://placehold.co/40x40.png?text=CC', dataAiHint: 'person avatar', isFeatured: true, bio: 'Coral propagation expert. WYSIWYG frags available.' },
  { id: 'user4', name: 'Diana Driftwood', avatarUrl: 'https://placehold.co/40x40.png?text=DD', dataAiHint: 'avatar', bio: 'Collector and seller of unique driftwood pieces for aquascaping.' },
];


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
  category: string; 
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
  { name: 'Freshwater', slug: 'freshwater', description: 'Discussions about freshwater aquariums, fish, and plants.', icon: Fish },
  { name: 'Saltwater', slug: 'saltwater', description: 'All about saltwater tanks, marine fish, and invertebrates.', icon: Fish }, 
  { name: 'Reef Tanks', slug: 'reef-tanks', description: 'Focus on coral care, reef ecosystems, and advanced setups.', icon: Leaf }, 
  { name: 'Fish Health', slug: 'fish-health', description: 'Diagnosing and treating fish diseases and health issues.', icon: HeartHandshake },
  { name: 'Aquascaping & Plants', slug: 'aquascaping-plants', description: 'The art of aquarium design and live plant care.', icon: Leaf },
  { name: 'Equipment & Setup', slug: 'equipment-setup', description: 'Filters, lighting, heaters, and setting up new tanks.', icon: PackageIcon },
  { name: 'General Discussion', slug: 'general-discussion', description: 'For everything else related to the aquarium hobby.', icon: MessageSquare },
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
  icon?: ElementType<LucideProps>; 
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
  tags?: string[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OperatingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface LocalFishStore {
  id: string;
  name: string;
  slug: string; 
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
  description?: string;
  imageUrl?: string;
  imageHint?: string; 
  coordinates?: Coordinates; 
  operatingHours?: OperatingHours;
  services?: string[]; 
  isVerified?: boolean; 
  isFeatured?: boolean; 
}

// Moved from /src/app/local-fish-stores/page.tsx
export const mockLocalFishStoresData: LocalFishStore[] = [
  {
    id: 'lfs1',
    name: 'Aqua World Emporium',
    slug: 'aqua-world-emporium-springfield',
    address: '123 Main Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    phone: '217-555-1212',
    website: 'https://www.aquaworldemporium.example.com',
    description: 'Springfield\'s largest selection of freshwater and saltwater fish, corals, and supplies. Expert advice and friendly service.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'fish store interior',
    operatingHours: {
      monday: '10 AM - 7 PM',
      tuesday: '10 AM - 7 PM',
      wednesday: '10 AM - 7 PM',
      thursday: '10 AM - 8 PM',
      friday: '10 AM - 8 PM',
      saturday: '9 AM - 6 PM',
      sunday: '12 PM - 5 PM',
    },
    services: ['Freshwater Fish', 'Saltwater Fish', 'Corals', 'Live Plants', 'Aquarium Supplies', 'Water Testing'],
    isVerified: true,
    isFeatured: true, 
  },
  {
    id: 'lfs2',
    name: 'The Reef Corner',
    slug: 'the-reef-corner-shelbyville',
    address: '456 Ocean Drive',
    city: 'Shelbyville',
    state: 'IL',
    zipCode: '62565',
    phone: '217-555-REEF',
    website: 'https://www.thereefcorner.example.com',
    description: 'Specializing in rare and exotic corals, high-end reef equipment, and custom aquarium installations.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'coral reef tank',
    operatingHours: {
      monday: 'Closed',
      tuesday: '11 AM - 6 PM',
      wednesday: '11 AM - 6 PM',
      thursday: '11 AM - 7 PM',
      friday: '11 AM - 7 PM',
      saturday: '10 AM - 5 PM',
      sunday: 'Closed',
    },
    services: ['Saltwater Fish', 'Corals', 'Reef Supplies', 'RODI Water'],
    isVerified: false,
    isFeatured: false,
  },
  {
    id: 'lfs3',
    name: 'Planted Aquatics & More',
    slug: 'planted-aquatics-capital-city',
    address: '789 River Road',
    city: 'Capital City',
    state: 'IL',
    zipCode: '62704',
    phone: '217-555-PLNT',
    description: 'Your source for aquascaping supplies, a wide variety of aquatic plants, and nano fish.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'aquascape planted tank',
    operatingHours: {
      saturday: '10 AM - 4 PM',
      sunday: '12 PM - 4 PM',
    },
    services: ['Aquatic Plants', 'Nano Fish', 'Shrimp', 'Aquascaping Supplies', 'Hardscape'],
    isVerified: true,
    isFeatured: false,
  },
];

// Export aquarium management types
export * from './aquarium';
