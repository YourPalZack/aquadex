// Types for Local Fish Store directory and map

export type StoreCategory = 'freshwater' | 'saltwater' | 'plants' | 'reptiles' | 'general';

// Business hours types used by directory and profile
export interface DayHours {
  open: string; // "HH:MM"
  close: string; // "HH:MM"
  closed?: boolean;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  exceptions?: {
    date: string;
    open: string;
    close: string;
    closed: boolean;
  }[];
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

// Store form data used by signup/update actions
export interface StoreFormData {
  business_name: string;
  owner_name?: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  business_hours: BusinessHours;
  categories: StoreCategory[];
  payment_methods?: string[];
  social_links?: SocialLinks;
}

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
