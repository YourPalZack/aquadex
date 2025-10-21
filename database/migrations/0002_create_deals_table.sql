-- Migration: Create Deals Table
-- Feature: Local Fish Store Directory
-- Date: 2025-10-21

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Deal details
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  
  -- Discount information
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  terms_conditions TEXT,
  
  -- Validity period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  
  -- Analytics
  view_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_discount_type CHECK (
    discount_type IN ('percentage', 'fixed_amount', 'bogo', 'freebie')
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('draft', 'active', 'expired')
  ),
  CONSTRAINT valid_dates CHECK (
    end_date >= start_date
  ),
  CONSTRAINT valid_percentage CHECK (
    discount_type != 'percentage' OR (discount_value >= 0 AND discount_value <= 100)
  ),
  CONSTRAINT valid_fixed_amount CHECK (
    discount_type != 'fixed_amount' OR discount_value >= 0
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS deals_store_id_idx ON deals(store_id);
CREATE INDEX IF NOT EXISTS deals_status_end_date_idx ON deals(status, end_date);
CREATE INDEX IF NOT EXISTS deals_end_date_idx ON deals(end_date);
CREATE INDEX IF NOT EXISTS deals_created_at_idx ON deals(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to enforce 10-deal limit per store
CREATE OR REPLACE FUNCTION check_store_deal_limit()
RETURNS TRIGGER AS $$
DECLARE
  active_deal_count INTEGER;
BEGIN
  -- Count active deals for this store
  SELECT COUNT(*) INTO active_deal_count
  FROM deals
  WHERE store_id = NEW.store_id
    AND is_active = TRUE
    AND status = 'active'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
  
  -- Check if limit would be exceeded
  IF active_deal_count >= 10 AND NEW.is_active = TRUE AND NEW.status = 'active' THEN
    RAISE EXCEPTION 'Store cannot have more than 10 active deals';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce deal limit
CREATE TRIGGER enforce_deal_limit
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION check_store_deal_limit();

-- Create function to auto-expire deals
CREATE OR REPLACE FUNCTION auto_expire_deals()
RETURNS TRIGGER AS $$
BEGIN
  -- Set status to expired if end_date has passed
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'active' THEN
    NEW.status := 'expired';
    NEW.is_active := FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-expiration on update
CREATE TRIGGER deals_auto_expire
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION auto_expire_deals();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active deals from verified stores
CREATE POLICY "Public can view active deals"
ON deals FOR SELECT
USING (
  is_active = TRUE AND
  status = 'active' AND
  end_date >= CURRENT_DATE AND
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = deals.store_id
      AND stores.verification_status = 'verified'
      AND stores.is_active = TRUE
  )
);

-- Policy: Store owners can view their own deals (any status)
CREATE POLICY "Store owners can view own deals"
ON deals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = deals.store_id
      AND stores.user_id = auth.uid()
  )
);

-- Policy: Store owners can create deals for their store
CREATE POLICY "Store owners can create deals"
ON deals FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = deals.store_id
      AND stores.user_id = auth.uid()
      AND stores.verification_status = 'verified'
  )
);

-- Policy: Store owners can update their own deals
CREATE POLICY "Store owners can update own deals"
ON deals FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = deals.store_id
      AND stores.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = deals.store_id
      AND stores.user_id = auth.uid()
  )
);

-- Policy: Store owners can delete their own deals
CREATE POLICY "Store owners can delete own deals"
ON deals FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = deals.store_id
      AND stores.user_id = auth.uid()
  )
);

-- Comments for documentation
COMMENT ON TABLE deals IS 'Store deals and discounts with time-limited validity';
COMMENT ON COLUMN deals.discount_type IS 'Type of discount: percentage, fixed_amount, bogo, or freebie';
COMMENT ON COLUMN deals.discount_value IS 'Numeric value of discount (percentage 0-100 or dollar amount)';
COMMENT ON COLUMN deals.start_date IS 'Date when deal becomes active';
COMMENT ON COLUMN deals.end_date IS 'Date when deal expires (inclusive)';
COMMENT ON COLUMN deals.status IS 'Deal status: draft, active, or expired';
COMMENT ON COLUMN deals.view_count IS 'Number of times deal has been viewed';
