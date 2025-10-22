-- Migration: Create RPC search_stores for geospatial directory queries
-- Date: 2025-10-22

-- Function returns filtered, paginated stores with distance and total count
CREATE OR REPLACE FUNCTION public.search_stores(
  p_q TEXT DEFAULT NULL,
  p_categories TEXT[] DEFAULT NULL,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_miles NUMERIC DEFAULT 25,
  p_limit INTEGER DEFAULT 24,
  p_offset INTEGER DEFAULT 0,
  p_sort_by TEXT DEFAULT 'latest'
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  business_name TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  phone TEXT,
  website TEXT,
  categories TEXT[],
  gallery_images TEXT[],
  verification_status TEXT,
  is_active BOOLEAN,
  latitude NUMERIC,
  longitude NUMERIC,
  distance_miles NUMERIC,
  total_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_point GEOGRAPHY(POINT, 4326);
BEGIN
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    user_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::GEOGRAPHY;
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT s.*,
      CASE 
        WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN ST_Distance(s.location, user_point) / 1609.344
        ELSE NULL
      END AS distance_miles_calc
    FROM stores s
    WHERE s.verification_status = 'verified'
      AND s.is_active = TRUE
      AND (
        p_q IS NULL OR p_q = '' OR (
          s.business_name ILIKE '%' || p_q || '%' OR
          s.city ILIKE '%' || p_q || '%' OR
          s.state ILIKE '%' || p_q || '%' OR
          s.postal_code ILIKE '%' || p_q || '%'
        )
      )
      AND (
        p_categories IS NULL OR array_length(p_categories, 1) IS NULL OR s.categories && p_categories
      )
      AND (
        user_point IS NULL OR ST_DWithin(s.location, user_point, (p_radius_miles * 1609.344))
      )
  ),
  counted AS (
    SELECT *, COUNT(*) OVER() AS total_count_calc FROM base
  ),
  ordered AS (
    SELECT * FROM counted
    ORDER BY 
      CASE WHEN p_sort_by = 'nearest' AND distance_miles_calc IS NOT NULL THEN 0 ELSE 1 END,
      CASE WHEN p_sort_by = 'nearest' THEN distance_miles_calc END ASC,
      CASE WHEN p_sort_by <> 'nearest' THEN created_at END DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT 
    id,
    slug,
    business_name,
    city,
    state,
    postal_code,
    phone,
    website,
    categories,
    gallery_images,
    verification_status,
    is_active,
    latitude,
    longitude,
    distance_miles_calc AS distance_miles,
    total_count_calc AS total_count
  FROM ordered;
END;
$$;

-- Allow anonymous and authenticated roles to execute the function
GRANT EXECUTE ON FUNCTION public.search_stores(TEXT, TEXT[], DOUBLE PRECISION, DOUBLE PRECISION, NUMERIC, INTEGER, INTEGER, TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.search_stores IS 'Search stores with optional text, categories, location radius, pagination, and sorting. Returns distance and total_count.';
