-- AquaDex Storage Buckets Setup for Supabase
-- Run this SQL after creating the main schema

-- Note: Storage buckets should ideally be created through Supabase Dashboard (Storage section)
-- But you can also create them via SQL with proper permissions

-- Create storage buckets (if not exists)
-- Profile Photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Aquarium Photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('aquarium-photos', 'aquarium-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Water Test Images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('water-test-images', 'water-test-images', true)
ON CONFLICT (id) DO NOTHING;

-- Marketplace Listing Images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-images', 'marketplace-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-photos bucket
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Profile photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Storage policies for aquarium-photos bucket
CREATE POLICY "Users can upload aquarium photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'aquarium-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their aquarium photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'aquarium-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their aquarium photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'aquarium-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Aquarium photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'aquarium-photos');

-- Storage policies for water-test-images bucket
CREATE POLICY "Users can upload water test images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'water-test-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their water test images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'water-test-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their water test images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'water-test-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Water test images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'water-test-images');

-- Storage policies for marketplace-images bucket
CREATE POLICY "Users can upload marketplace images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their marketplace images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'marketplace-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their marketplace images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'marketplace-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Marketplace images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-images');

-- Set file size limits (5MB) per bucket
-- Note: This is typically done through Supabase Dashboard or API
-- ALTER TABLE storage.buckets SET (file_size_limit = 5242880) WHERE id IN (
--   'profile-photos', 'aquarium-photos', 'water-test-images', 'marketplace-images'
-- );

-- Allowed MIME types (configure via Dashboard):
-- image/jpeg, image/png, image/webp
