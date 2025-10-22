import type { StoreCategory, BusinessHours } from '@/types/store';

export interface MockStore {
  id: string;
  slug: string;
  business_name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
  street?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  categories: StoreCategory[];
  gallery_images?: string[];
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  business_hours?: BusinessHours;
}

const defaultHours: BusinessHours = {
  monday: { open: '10:00', close: '19:00' },
  tuesday: { open: '10:00', close: '19:00' },
  wednesday: { open: '10:00', close: '19:00' },
  thursday: { open: '10:00', close: '20:00' },
  friday: { open: '10:00', close: '20:00' },
  saturday: { open: '10:00', close: '18:00' },
  sunday: { open: '12:00', close: '17:00' },
};

export const mockStores: MockStore[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'aqua-world-emporium-springfield',
    business_name: 'Aqua World Emporium',
    email: 'contact@aquaworld.example.com',
    phone: '217-555-1212',
    website: 'https://www.aquaworldemporium.example.com',
    description: 'Springfield\'s largest selection of freshwater and saltwater fish, corals, and supplies.',
    street: '123 Main Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    country: 'US',
    categories: ['freshwater','saltwater','plants','general'],
    gallery_images: ['https://placehold.co/800x450.png?text=Aqua+World+Emporium'],
    verification_status: 'verified',
    is_active: true,
    latitude: 39.799017, 
    longitude: -89.643957,
    business_hours: defaultHours,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    slug: 'the-reef-corner-shelbyville',
    business_name: 'The Reef Corner',
    phone: '217-555-7333',
    website: 'https://www.thereefcorner.example.com',
    description: 'Specializing in corals and marine fish with high-end reef equipment.',
    street: '456 Ocean Drive',
    city: 'Shelbyville',
    state: 'IL',
    zip: '62565',
    country: 'US',
    categories: ['saltwater'],
    gallery_images: ['https://placehold.co/800x450.png?text=Reef+Corner'],
    verification_status: 'verified',
    is_active: true,
    latitude: 39.406976,
    longitude: -88.790314,
    business_hours: defaultHours,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    slug: 'planted-aquatics-capital-city',
    business_name: 'Planted Aquatics & More',
    phone: '217-555-7568',
    description: 'Your source for aquascaping supplies and aquatic plants.',
    street: '789 River Road',
    city: 'Capital City',
    state: 'IL',
    zip: '62704',
    country: 'US',
    categories: ['plants','freshwater'],
    gallery_images: ['https://placehold.co/800x450.png?text=Planted+Aquatics'],
    verification_status: 'verified',
    is_active: true,
    latitude: 39.781721,
    longitude: -89.650148,
    business_hours: defaultHours,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    slug: 'reef-and-river-boston',
    business_name: 'Reef & River Boston',
    phone: '617-555-1100',
    website: 'https://reefandriver.example.com',
    city: 'Boston',
    state: 'MA',
    zip: '02116',
    categories: ['saltwater','freshwater','general'],
    gallery_images: ['https://placehold.co/800x450.png?text=Reef+%26+River'],
    verification_status: 'verified',
    is_active: true,
    latitude: 42.3493,
    longitude: -71.0736,
    business_hours: defaultHours,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    slug: 'seattle-plants-and-fins',
    business_name: 'Seattle Plants & Fins',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    categories: ['plants','freshwater'],
    verification_status: 'verified',
    is_active: true,
    latitude: 47.6097,
    longitude: -122.3331,
    business_hours: defaultHours,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    slug: 'miami-reptiles-and-aquatics',
    business_name: 'Miami Reptiles & Aquatics',
    city: 'Miami',
    state: 'FL',
    zip: '33130',
    categories: ['reptiles','freshwater'],
    verification_status: 'verified',
    is_active: true,
    latitude: 25.7743,
    longitude: -80.1937,
    business_hours: defaultHours,
  },
];
