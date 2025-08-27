-- Drobe App - Complete Supabase Schema Setup
-- This script creates all the necessary tables for your closet app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET row_security = on;

-- 1. Profiles table (for user data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Items table (your clothing items)
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  bg_removed_url TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  colors TEXT[] DEFAULT '{}',
  fabric TEXT,
  seasons TEXT[] DEFAULT '{}',
  occasions TEXT[] DEFAULT '{}',
  price DECIMAL(10,2),
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  worn_count INTEGER DEFAULT 0,
  last_worn TIMESTAMPTZ,
  notes TEXT,
  ai_analysis JSONB,
  wardrobe_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Wardrobes table (organize items into wardrobes)
CREATE TABLE IF NOT EXISTS wardrobes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT 'wardrobe',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Outfits table
CREATE TABLE IF NOT EXISTS outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  occasions TEXT[] DEFAULT '{}',
  seasons TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Outfit Items (junction table)
CREATE TABLE IF NOT EXISTS outfit_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Wear logs (track when items/outfits are worn)
CREATE TABLE IF NOT EXISTS wear_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
  worn_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  weather TEXT,
  mood TEXT
);

-- Add foreign key for wardrobe_id in items table
ALTER TABLE items 
ADD CONSTRAINT items_wardrobe_id_fkey 
FOREIGN KEY (wardrobe_id) REFERENCES wardrobes(id) ON DELETE SET NULL;

-- Row Level Security Policies

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Items policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own items" ON items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON items FOR DELETE USING (auth.uid() = user_id);

-- Wardrobes policies
ALTER TABLE wardrobes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wardrobes" ON wardrobes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wardrobes" ON wardrobes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wardrobes" ON wardrobes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wardrobes" ON wardrobes FOR DELETE USING (auth.uid() = user_id);

-- Outfits policies
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own outfits" ON outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outfits" ON outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outfits" ON outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own outfits" ON outfits FOR DELETE USING (auth.uid() = user_id);

-- Outfit items policies
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own outfit items" ON outfit_items FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM outfits WHERE id = outfit_id
  )
);
CREATE POLICY "Users can insert own outfit items" ON outfit_items FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM outfits WHERE id = outfit_id
  )
);
CREATE POLICY "Users can delete own outfit items" ON outfit_items FOR DELETE USING (
  auth.uid() IN (
    SELECT user_id FROM outfits WHERE id = outfit_id
  )
);

-- Wear logs policies
ALTER TABLE wear_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wear logs" ON wear_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wear logs" ON wear_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wear logs" ON wear_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wear logs" ON wear_logs FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS items_category_idx ON items(category);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items(created_at);
CREATE INDEX IF NOT EXISTS wardrobes_user_id_idx ON wardrobes(user_id);
CREATE INDEX IF NOT EXISTS outfits_user_id_idx ON outfits(user_id);
CREATE INDEX IF NOT EXISTS outfit_items_outfit_id_idx ON outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS outfit_items_item_id_idx ON outfit_items(item_id);
CREATE INDEX IF NOT EXISTS wear_logs_user_id_idx ON wear_logs(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wardrobes_updated_at BEFORE UPDATE ON wardrobes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outfits_updated_at BEFORE UPDATE ON outfits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default wardrobe for existing users (optional)
-- This will run when users sign up
CREATE OR REPLACE FUNCTION create_default_wardrobe()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wardrobes (user_id, name, description, color, icon)
  VALUES (
    NEW.id,
    'My Wardrobe',
    'Default wardrobe',
    '#10b981',
    'wardrobe'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default wardrobe when user signs up
CREATE TRIGGER create_default_wardrobe_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_wardrobe();
