-- Migration: Create Stores Table
-- Feature: Local Fish Store Directory
-- Date: 2025-10-21

-- Enable PostGIS extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL UNIQUE,
  slug VARCHAR(250) NOT NULL UNIQUE,
  
  -- Location fields
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'US',
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Contact fields
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(500),
  social_links JSONB,
  
  -- Business details
  description TEXT,
  business_hours JSONB NOT NULL,
  categories TEXT[] NOT NULL,
  payment_methods TEXT[],
  
  -- Media
  profile_image_url VARCHAR(500),
  gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status fields
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_verification_status CHECK (
    verification_status IN ('pending', 'verified', 'rejected')
  ),
  CONSTRAINT valid_state_code CHECK (
    state ~ '^[A-Z]{2}$'
  ),
  CONSTRAINT valid_zip_code CHECK (
    postal_code ~ '^\d{5}(-\d{4})?$'
  ),
  CONSTRAINT valid_gallery_limit CHECK (
    array_length(gallery_images, 1) IS NULL OR array_length(gallery_images, 1) <= 5
  ),
  CONSTRAINT valid_categories CHECK (
    categories <@ ARRAY['freshwater', 'saltwater', 'plants', 'reptiles', 'general']::TEXT[]
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS stores_location_idx ON stores USING GIST(location);
CREATE INDEX IF NOT EXISTS stores_slug_idx ON stores(slug);
CREATE INDEX IF NOT EXISTS stores_city_state_idx ON stores(city, state);
CREATE INDEX IF NOT EXISTS stores_verification_status_idx ON stores(verification_status);
CREATE INDEX IF NOT EXISTS stores_categories_idx ON stores USING GIN(categories);
CREATE INDEX IF NOT EXISTS stores_user_id_idx ON stores(user_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create helper function to check if store is currently open
CREATE OR REPLACE FUNCTION is_store_open(business_hours JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  current_day TEXT;
  current_time TIME;
  day_hours JSONB;
BEGIN
  -- Get current day of week (lowercase)
  current_day := LOWER(TO_CHAR(NOW(), 'Day'));
  current_day := TRIM(current_day); -- Remove trailing spaces
  current_time := NOW()::TIME;
  
  -- Get hours for current day
  day_hours := business_hours->current_day;
  
  -- Check if day_hours exists
  IF day_hours IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if closed
  IF (day_hours->>'closed')::BOOLEAN = TRUE THEN
    RETURN FALSE;
  END IF;
  
  -- Check if current time is within business hours
  RETURN current_time BETWEEN 
    (day_hours->>'open')::TIME AND 
    (day_hours->>'close')::TIME;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view verified and active stores
CREATE POLICY "Public can view verified stores"
ON stores FOR SELECT
USING (
  verification_status = 'verified' AND
  is_active = TRUE
);

-- Policy: Store owners can view their own stores (any status)
CREATE POLICY "Store owners can view own store"
ON stores FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Authenticated users can create stores
CREATE POLICY "Authenticated users can create stores"
ON stores FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  -- Ensure user doesn't already have a store
  NOT EXISTS (
    SELECT 1 FROM stores WHERE user_id = auth.uid()
  )
);

-- Policy: Store owners can update their own stores
CREATE POLICY "Store owners can update own store"
ON stores FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Store owners can soft-delete their own stores
CREATE POLICY "Store owners can deactivate own store"
ON stores FOR UPDATE
USING (auth.uid() = user_id AND is_active = TRUE)
WITH CHECK (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE stores IS 'Local fish store profiles with location data';
COMMENT ON COLUMN stores.location IS 'PostGIS geography point for spatial queries';
COMMENT ON COLUMN stores.business_hours IS 'JSON object with day-of-week keys and open/close times';
COMMENT ON COLUMN stores.categories IS 'Array of store specialties (freshwater, saltwater, plants, etc.)';
COMMENT ON COLUMN stores.gallery_images IS 'Array of image URLs (max 5)';
COMMENT ON COLUMN stores.verification_status IS 'Store verification status: pending, verified, or rejected';
