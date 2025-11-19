-- Complete Profiles System Setup
-- This migration creates the profiles table, storage bucket, and all necessary policies

-- ========================================
-- 1. CREATE PROFILES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL
);

-- Add columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
    ALTER TABLE profiles ADD COLUMN address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
  END IF;
END $$;

-- ========================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. PROFILES TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ========================================
-- 4. CREATE STORAGE BUCKET
-- ========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 5. STORAGE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can view any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Anyone can view avatars (public bucket)
CREATE POLICY "Users can view any avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

-- Users can upload files that start with their user ID
-- Filename format: avatars/{user_id}-{timestamp}.{ext}
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = substring(storage.filename(name) from 1 for 36)
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = substring(storage.filename(name) from 1 for 36)
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = substring(storage.filename(name) from 1 for 36)
  );

-- ========================================
-- 6. AUTO-CREATE PROFILE ON USER SIGNUP
-- ========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- 7. CREATE INDEX
-- ========================================

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- ========================================
-- 8. VERIFY SETUP
-- ========================================

SELECT
  'Profiles table columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
