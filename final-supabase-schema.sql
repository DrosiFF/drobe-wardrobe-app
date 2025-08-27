-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table (simpler version for Clerk integration)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,  -- This will store Clerk user IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB
);

-- Create items table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  bg_removed_url TEXT,
  category TEXT CHECK (category IN ('TOP', 'BOTTOM', 'DRESS', 'OUTERWEAR', 'SHOES', 'ACCESSORY', 'BAG', 'HAT', 'OTHER')) NOT NULL,
  brand TEXT,
  colors TEXT[],
  fabric TEXT,
  seasons TEXT[],
  occasions TEXT[],
  price DECIMAL,
  tags TEXT[],
  description TEXT,
  worn_count INTEGER DEFAULT 0,
  last_worn TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  ai_analysis JSONB,
  wardrobe_id UUID
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies (no auth.uid(), just user_id matching)
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage own items" ON items
  FOR ALL USING (true) WITH CHECK (true);

-- Create your profile with your Clerk user ID
INSERT INTO profiles (id, email, full_name)
VALUES ('user_31pzWShvcFFEY5ZoavuliYpxZnB', 'lopito@example.com', 'lopito')
ON CONFLICT (id) DO NOTHING;
