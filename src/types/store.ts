// Types for Local Fish Store directory and map

export type StoreCategory = 'freshwater' | 'saltwater' | 'plants' | 'reptiles' | 'general';

// Minimal store shape used in list views and map
export interface StoreListItem {
  id: string;
  slug: string;
  business_name: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  website: string | null;
  categories: string[]; // server returns string[]
  gallery_images: string[] | null;
  verification_status?: string;
  latitude?: number | null;
  longitude?: number | null;
  distance_miles?: number | null;
}
