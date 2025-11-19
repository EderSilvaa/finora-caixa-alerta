-- Fix storage policies for avatars
-- The issue is that we need to extract the UUID from the filename
-- Filename format: avatars/{user_id}-{timestamp}.{ext}
-- Example: avatars/3a03b5cb-5356-4642-90c2-5bd0c8e35571-1763567287306.jpg

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can view any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create new storage policies with corrected logic
-- Anyone can view avatars (public bucket)
CREATE POLICY "Users can view any avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

-- Users can upload files that start with their user ID (extract first 36 chars for UUID)
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = substring(storage.filename(name) from 1 for 36)
  );

-- Users can update files that start with their user ID
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = substring(storage.filename(name) from 1 for 36)
  );

-- Users can delete files that start with their user ID
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = substring(storage.filename(name) from 1 for 36)
  );
