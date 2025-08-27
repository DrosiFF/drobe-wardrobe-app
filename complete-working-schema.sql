-- Complete Working Schema for Drobe App
-- Run this ENTIRE script in your Supabase SQL Editor

-- Clean slate first
DROP TABLE IF EXISTS item_photos CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS wardrobes CASCADE;
DROP TABLE IF EXISTS outfits CASCADE;
DROP TABLE IF EXISTS outfit_items CASCADE;
DROP TABLE IF EXISTS wear_logs CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- NOW CREATE THE NEW TABLES
-- =========================

-- 1. Users table (for Clerk integration)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories table
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Items table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  color_tags TEXT[] DEFAULT '{}',
  size_label TEXT,
  material TEXT,
  season TEXT,
  price_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  category_id BIGINT REFERENCES categories(id),
  source_label TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Item photos table
CREATE TABLE item_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DATA
-- =========

-- Insert categories
INSERT INTO categories (slug, name) VALUES
  ('tops', 'Tops'),
  ('bottoms', 'Bottoms'),
  ('outerwear', 'Outerwear'),
  ('footwear', 'Footwear'),
  ('accessories', 'Accessories'),
  ('dresses', 'Dresses'),
  ('activewear', 'Activewear');

-- SECURITY SETTINGS
-- ================

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create simple policies (allow all for now)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on item_photos" ON item_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow read access to categories" ON categories FOR SELECT USING (true);

-- INDEXES FOR PERFORMANCE
-- ======================

CREATE INDEX items_user_id_idx ON items(user_id);
CREATE INDEX items_category_id_idx ON items(category_id);
CREATE INDEX item_photos_item_id_idx ON item_photos(item_id);

-- VERIFICATION
-- ===========

-- Test that everything was created successfully
SELECT 'SUCCESS: All tables created!' as status;
SELECT 'Categories loaded: ' || count(*)::text as category_status FROM categories;
SELECT 'Ready to use!' as final_status;
