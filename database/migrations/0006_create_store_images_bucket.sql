-- Migration: Create store-images storage bucket and policies
-- Date: 2025-10-22

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-images', 'store-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to store-images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload store images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'store-images');

-- Allow authenticated users to update their objects (coarse policy; app enforces ownership)
CREATE POLICY IF NOT EXISTS "Authenticated users can update store images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'store-images');

-- Allow authenticated users to delete their objects (coarse policy; app enforces ownership)
CREATE POLICY IF NOT EXISTS "Authenticated users can delete store images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'store-images');

-- Public read access to store images
CREATE POLICY IF NOT EXISTS "Public can view store images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-images');

COMMENT ON TABLE storage.objects IS 'Storage objects for Supabase buckets (includes store-images)';
COMMENT ON POLICY "Authenticated users can upload store images" ON storage.objects IS 'Upload policy for store-images bucket';
