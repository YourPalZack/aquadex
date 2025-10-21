-- Migration: Create Additional Indexes
-- Feature: Local Fish Store Directory
-- Date: 2025-10-21

-- Additional performance indexes beyond those in table creation

-- Composite index for deal queries
CREATE INDEX IF NOT EXISTS deals_store_active_idx 
ON deals(store_id, is_active, status) 
WHERE is_active = TRUE AND status = 'active';

-- Index for deal expiration queries
CREATE INDEX IF NOT EXISTS deals_expiring_soon_idx 
ON deals(end_date) 
WHERE is_active = TRUE AND status = 'active';

-- Composite index for store search with categories
CREATE INDEX IF NOT EXISTS stores_verified_active_idx 
ON stores(verification_status, is_active) 
WHERE verification_status = 'verified' AND is_active = TRUE;

-- Full text search index on store business names (optional - for fuzzy search)
-- CREATE INDEX IF NOT EXISTS stores_business_name_trgm_idx 
-- ON stores USING gin (business_name gin_trgm_ops);
-- Requires: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Comments
COMMENT ON INDEX deals_store_active_idx IS 'Optimizes queries for active deals by store';
COMMENT ON INDEX deals_expiring_soon_idx IS 'Optimizes queries for expiring deals';
COMMENT ON INDEX stores_verified_active_idx IS 'Optimizes public directory queries';
