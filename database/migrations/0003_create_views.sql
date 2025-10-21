-- Migration: Create Database Views
-- Feature: Local Fish Store Directory
-- Date: 2025-10-21

-- View: Active Stores
-- Pre-filters verified and active stores for public directory

CREATE OR REPLACE VIEW active_stores AS
SELECT *
FROM stores
WHERE verification_status = 'verified'
  AND is_active = TRUE;

COMMENT ON VIEW active_stores IS 'Verified and active stores visible to public';

-- View: Active Deals
-- Pre-filters currently valid deals from verified stores

CREATE OR REPLACE VIEW active_deals AS
SELECT 
  d.*,
  s.business_name,
  s.slug AS store_slug,
  s.city,
  s.state,
  s.latitude,
  s.longitude
FROM deals d
JOIN stores s ON d.store_id = s.id
WHERE d.is_active = TRUE
  AND d.status = 'active'
  AND d.end_date >= CURRENT_DATE
  AND s.verification_status = 'verified'
  AND s.is_active = TRUE;

COMMENT ON VIEW active_deals IS 'Active deals from verified stores with store context';

-- View: Stores with Deal Count
-- Stores with their active deal count for dashboard display

CREATE OR REPLACE VIEW stores_with_deal_count AS
SELECT 
  s.*,
  COALESCE(deal_count, 0) AS active_deals_count
FROM stores s
LEFT JOIN (
  SELECT store_id, COUNT(*) AS deal_count
  FROM deals
  WHERE is_active = TRUE
    AND status = 'active'
    AND end_date >= CURRENT_DATE
  GROUP BY store_id
) AS deal_counts ON s.id = deal_counts.store_id;

COMMENT ON VIEW stores_with_deal_count IS 'Stores with count of their active deals';
