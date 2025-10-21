# Data Model

**Feature**: Local Fish Store Directory  
**Date**: October 20, 2025  
**Phase**: 1 - Design & Contracts

## Entity Definitions

### 1. Store Profile

**Purpose**: Represents a local fish store business with location, contact details, and business information.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique store identifier |
| `user_id` | UUID | FOREIGN KEY (auth.users), NOT NULL, UNIQUE | Owner's user account (one store per user initially) |
| `business_name` | VARCHAR(200) | NOT NULL, UNIQUE | Official business name |
| `slug` | VARCHAR(250) | NOT NULL, UNIQUE | URL-friendly identifier (e.g., "joes-aquarium-boston-ma") |
| `owner_name` | VARCHAR(100) | NOT NULL | Primary contact person name |
| `email` | VARCHAR(255) | NOT NULL | Store contact email (verified via auth) |
| `phone` | VARCHAR(20) | NOT NULL | Store phone number (format: +1XXXXXXXXXX) |
| `website` | VARCHAR(500) | NULL | Store website URL |
| `description` | TEXT | NULL | Store description/bio (max 1000 chars) |
| `street_address` | VARCHAR(255) | NOT NULL | Street address line |
| `city` | VARCHAR(100) | NOT NULL | City name |
| `state` | VARCHAR(2) | NOT NULL | US state code (e.g., "MA") |
| `zip_code` | VARCHAR(10) | NOT NULL | ZIP code (format: XXXXX or XXXXX-XXXX) |
| `location` | GEOGRAPHY(POINT, 4326) | NOT NULL | PostGIS point (lat/lng) for distance queries |
| `profile_image_url` | VARCHAR(500) | NULL | Main store photo URL (Supabase Storage) |
| `gallery_images` | TEXT[] | NULL | Array of gallery image URLs (max 5) |
| `business_hours` | JSONB | NOT NULL | Operating hours by day of week |
| `specialties` | TEXT[] | NOT NULL | Store specialties (e.g., ["freshwater", "saltwater", "plants"]) |
| `payment_methods` | TEXT[] | NULL | Accepted payment methods (e.g., ["cash", "credit", "paypal"]) |
| `social_links` | JSONB | NULL | Social media links (facebook, instagram, etc.) |
| `verification_status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Status: 'pending', 'verified', 'rejected', 'inactive' |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft delete flag (false = deactivated) |
| `inactive_since` | TIMESTAMP | NULL | When store was deactivated (for 90-day cleanup) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Relationships**:
- `user_id` → `auth.users.id` (one-to-one: each user can own one store)
- One store has many deals (one-to-many with `deals` table)

**Validation Rules**:
- Email must match verified email in `auth.users`
- Phone must be 10 digits (US format)
- ZIP code must be valid 5 or 9-digit format
- Location must be valid PostGIS POINT
- Specialties must be from predefined list
- Business hours JSON must have all 7 days with open/close times or closed flag
- Gallery images limited to 5 URLs maximum
- Verification status can only transition: pending → verified OR pending → rejected

**State Transitions**:
```
pending → verified (admin approval or auto-verify)
pending → rejected (admin rejection)
verified → inactive (store owner deactivation)
inactive → verified (store owner reactivation within 90 days)
```

**Indexes**:
- `stores_location_idx` (GIST index on `location` for spatial queries)
- `stores_slug_idx` (B-tree index on `slug` for profile lookups)
- `stores_city_state_idx` (B-tree index on `city, state` for region searches)
- `stores_verification_status_idx` (B-tree index on `verification_status` for filtering)

**Business Hours JSON Structure**:
```json
{
  "monday": { "open": "09:00", "close": "18:00" },
  "tuesday": { "open": "09:00", "close": "18:00" },
  "wednesday": { "open": "09:00", "close": "18:00" },
  "thursday": { "open": "09:00", "close": "18:00" },
  "friday": { "open": "09:00", "close": "20:00" },
  "saturday": { "open": "10:00", "close": "17:00" },
  "sunday": { "closed": true }
}
```

**Social Links JSON Structure**:
```json
{
  "facebook": "https://facebook.com/store",
  "instagram": "@storename",
  "twitter": "@storename"
}
```

---

### 2. Deal/Discount

**Purpose**: Represents a promotional offer from a store with time-limited validity.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique deal identifier |
| `store_id` | UUID | FOREIGN KEY (stores), NOT NULL | Associated store |
| `title` | VARCHAR(200) | NOT NULL | Deal title/headline |
| `description` | TEXT | NOT NULL | Full deal description (max 1000 chars) |
| `discount_type` | VARCHAR(20) | NOT NULL | Type: 'percentage', 'fixed_amount', 'bogo', 'other' |
| `discount_value` | DECIMAL(10, 2) | NULL | Numeric value (e.g., 20 for 20% or $20 off) |
| `discount_text` | VARCHAR(100) | NULL | Display text (e.g., "Buy one get one free") |
| `start_date` | DATE | NOT NULL | Deal valid from date |
| `end_date` | DATE | NOT NULL | Deal valid until date (inclusive) |
| `applicable_categories` | TEXT[] | NULL | Product categories deal applies to (e.g., ["fish", "plants"]) |
| `terms_conditions` | TEXT | NULL | Additional terms/conditions |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'active' | Status: 'active', 'expired', 'inactive' |
| `view_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of times deal was viewed |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Relationships**:
- `store_id` → `stores.id` (many-to-one: each deal belongs to one store)

**Validation Rules**:
- `end_date` must be >= `start_date`
- `start_date` must be >= today (for new deals)
- If `discount_type` is 'percentage' or 'fixed_amount', `discount_value` is required
- If `discount_type` is 'other', `discount_text` is required
- Maximum 10 active deals per store (enforced via check constraint)
- Title must be unique per store (to prevent duplicates)

**State Transitions**:
```
active → expired (automatic when end_date passes or manual deactivation)
active → inactive (store owner deactivation)
inactive → active (store owner reactivation, if end_date >= today)
expired → [no transitions] (terminal state)
```

**Indexes**:
- `deals_store_id_idx` (B-tree index on `store_id` for store's deals lookups)
- `deals_status_end_date_idx` (B-tree index on `status, end_date` for active deals queries)
- `deals_end_date_idx` (B-tree index on `end_date` for expiration checking)

---

### 3. Store Category

**Purpose**: Represents specialty areas/product types for store filtering.

**Implementation**: ENUM or lookup table

**Values**:
- `freshwater_livestock` - Freshwater fish and invertebrates
- `saltwater_livestock` - Saltwater/marine fish and invertebrates
- `plants` - Aquarium plants (freshwater and saltwater)
- `equipment` - Filters, lights, heaters, etc.
- `aquascaping` - Rocks, driftwood, substrate
- `reef_supplies` - Coral, reef equipment, supplements
- `maintenance_services` - Tank cleaning, setup services
- `custom_builds` - Custom aquarium construction

**Usage**: Stored in `stores.specialties` array field

---

## Derived/Virtual Fields

### Store Open/Closed Status

**Computed at query time** based on current day/time and `business_hours` JSON:

```sql
-- PostgreSQL function to check if store is currently open
CREATE OR REPLACE FUNCTION is_store_open(business_hours JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  current_day TEXT;
  current_time TIME;
  day_hours JSONB;
BEGIN
  current_day := LOWER(TO_CHAR(NOW(), 'Day'));
  current_time := NOW()::TIME;
  
  day_hours := business_hours->current_day;
  
  IF day_hours->>'closed' = 'true' THEN
    RETURN FALSE;
  END IF;
  
  RETURN current_time BETWEEN 
    (day_hours->>'open')::TIME AND 
    (day_hours->>'close')::TIME;
END;
$$ LANGUAGE plpgsql;
```

### Distance from User

**Computed at query time** using PostGIS:

```sql
-- Calculate distance in miles
ST_Distance(
  stores.location::geography,
  ST_SetSRID(ST_MakePoint($user_lng, $user_lat), 4326)::geography
) / 1609.34 AS distance_miles
```

### Active Deals Count

**Computed via JOIN** or materialized view:

```sql
SELECT 
  s.*,
  COUNT(d.id) as active_deals_count
FROM stores s
LEFT JOIN deals d ON d.store_id = s.id 
  AND d.status = 'active' 
  AND d.end_date >= CURRENT_DATE
GROUP BY s.id;
```

---

## Database Views

### `active_stores`

**Purpose**: Pre-filter verified and active stores for public directory

```sql
CREATE VIEW active_stores AS
SELECT *
FROM stores
WHERE verification_status = 'verified'
  AND is_active = TRUE;
```

### `active_deals`

**Purpose**: Pre-filter currently valid deals

```sql
CREATE VIEW active_deals AS
SELECT d.*, s.business_name, s.city, s.state
FROM deals d
JOIN stores s ON d.store_id = s.id
WHERE d.status = 'active'
  AND d.end_date >= CURRENT_DATE
  AND s.verification_status = 'verified'
  AND s.is_active = TRUE;
```

---

## Database Migrations

### Migration 1: Create Stores Table

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL UNIQUE,
  slug VARCHAR(250) NOT NULL UNIQUE,
  owner_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  website VARCHAR(500),
  description TEXT,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  profile_image_url VARCHAR(500),
  gallery_images TEXT[],
  business_hours JSONB NOT NULL,
  specialties TEXT[] NOT NULL,
  payment_methods TEXT[],
  social_links JSONB,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  inactive_since TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_verification_status CHECK (
    verification_status IN ('pending', 'verified', 'rejected', 'inactive')
  ),
  CONSTRAINT valid_state_code CHECK (
    state ~ '^[A-Z]{2}$'
  ),
  CONSTRAINT valid_zip_code CHECK (
    zip_code ~ '^\d{5}(-\d{4})?$'
  ),
  CONSTRAINT gallery_images_limit CHECK (
    gallery_images IS NULL OR array_length(gallery_images, 1) <= 5
  )
);

-- Create indexes
CREATE INDEX stores_location_idx ON stores USING GIST(location);
CREATE INDEX stores_slug_idx ON stores(slug);
CREATE INDEX stores_city_state_idx ON stores(city, state);
CREATE INDEX stores_verification_status_idx ON stores(verification_status);
CREATE INDEX stores_user_id_idx ON stores(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create active_stores view
CREATE VIEW active_stores AS
SELECT * FROM stores
WHERE verification_status = 'verified' AND is_active = TRUE;
```

### Migration 2: Create Deals Table

```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10, 2),
  discount_text VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  applicable_categories TEXT[],
  terms_conditions TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_discount_type CHECK (
    discount_type IN ('percentage', 'fixed_amount', 'bogo', 'other')
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('active', 'expired', 'inactive')
  ),
  CONSTRAINT valid_date_range CHECK (
    end_date >= start_date
  ),
  CONSTRAINT discount_value_required CHECK (
    (discount_type IN ('percentage', 'fixed_amount') AND discount_value IS NOT NULL) OR
    (discount_type NOT IN ('percentage', 'fixed_amount'))
  ),
  CONSTRAINT discount_text_required CHECK (
    (discount_type = 'other' AND discount_text IS NOT NULL) OR
    (discount_type != 'other')
  ),
  CONSTRAINT unique_title_per_store UNIQUE(store_id, title)
);

-- Create indexes
CREATE INDEX deals_store_id_idx ON deals(store_id);
CREATE INDEX deals_status_end_date_idx ON deals(status, end_date);
CREATE INDEX deals_end_date_idx ON deals(end_date);

-- Create updated_at trigger
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create active_deals view
CREATE VIEW active_deals AS
SELECT d.*, s.business_name, s.city, s.state, s.location
FROM deals d
JOIN stores s ON d.store_id = s.id
WHERE d.status = 'active'
  AND d.end_date >= CURRENT_DATE
  AND s.verification_status = 'verified'
  AND s.is_active = TRUE;

-- Create function to enforce 10 deal limit per store
CREATE OR REPLACE FUNCTION check_store_deal_limit()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM deals
  WHERE store_id = NEW.store_id AND status = 'active';
  
  IF active_count >= 10 THEN
    RAISE EXCEPTION 'Store cannot have more than 10 active deals';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_deal_limit
  BEFORE INSERT ON deals
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION check_store_deal_limit();
```

---

## Row Level Security (RLS) Policies

### Stores Table

```sql
-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Public read access to verified active stores
CREATE POLICY "Public can view verified active stores"
  ON stores FOR SELECT
  USING (verification_status = 'verified' AND is_active = TRUE);

-- Store owners can view their own store (any status)
CREATE POLICY "Store owners can view own store"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

-- Store owners can insert their own store
CREATE POLICY "Users can create own store"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Store owners can update their own store (except verification_status)
CREATE POLICY "Store owners can update own store"
  ON stores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update verification_status (separate policy with admin role check)
```

### Deals Table

```sql
-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Public read access to active deals from verified stores
CREATE POLICY "Public can view active deals"
  ON deals FOR SELECT
  USING (
    status = 'active' AND
    end_date >= CURRENT_DATE AND
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = deals.store_id
        AND stores.verification_status = 'verified'
        AND stores.is_active = TRUE
    )
  );

-- Store owners can view all their own deals
CREATE POLICY "Store owners can view own deals"
  ON deals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = deals.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Store owners can create deals for their store
CREATE POLICY "Store owners can create own deals"
  ON deals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = deals.store_id
        AND stores.user_id = auth.uid()
        AND stores.verification_status = 'verified'
    )
  );

-- Store owners can update their own deals
CREATE POLICY "Store owners can update own deals"
  ON deals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = deals.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Store owners can delete their own deals
CREATE POLICY "Store owners can delete own deals"
  ON deals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = deals.store_id
        AND stores.user_id = auth.uid()
    )
  );
```

---

## TypeScript Interfaces

```typescript
// src/types/index.ts

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'inactive';
export type DealStatus = 'active' | 'expired' | 'inactive';
export type DiscountType = 'percentage' | 'fixed_amount' | 'bogo' | 'other';

export type StoreCategory = 
  | 'freshwater_livestock'
  | 'saltwater_livestock'
  | 'plants'
  | 'equipment'
  | 'aquascaping'
  | 'reef_supplies'
  | 'maintenance_services'
  | 'custom_builds';

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open?: string;  // "HH:MM" format
  close?: string; // "HH:MM" format
  closed?: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface Store {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  owner_name: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  profile_image_url?: string;
  gallery_images?: string[];
  business_hours: BusinessHours;
  specialties: StoreCategory[];
  payment_methods?: string[];
  social_links?: SocialLinks;
  verification_status: VerificationStatus;
  is_active: boolean;
  inactive_since?: string;
  created_at: string;
  updated_at: string;
  // Computed fields (added at query time)
  distance_miles?: number;
  is_open?: boolean;
  active_deals_count?: number;
}

export interface Deal {
  id: string;
  store_id: string;
  title: string;
  description: string;
  discount_type: DiscountType;
  discount_value?: number;
  discount_text?: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  applicable_categories?: string[];
  terms_conditions?: string;
  status: DealStatus;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields from active_deals view
  business_name?: string;
  city?: string;
  state?: string;
  location?: Store['location'];
}

export interface StoreWithDeals extends Store {
  deals: Deal[];
}
```

---

## Data Model Complete

All entities defined with attributes, relationships, validation rules, and TypeScript interfaces. Ready to proceed to API contract design.
