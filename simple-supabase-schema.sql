-- Simple working schema for Drobe app
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean slate - drop existing tables if they exist
DROP TABLE IF EXISTS item_photos CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (for Clerk integration)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create items table
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

-- Create item_photos table
CREATE TABLE item_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert basic categories
INSERT INTO categories (slug, name) VALUES
  ('tops', 'Tops'),
  ('bottoms', 'Bottoms'),
  ('outerwear', 'Outerwear'),
  ('footwear', 'Footwear'),
  ('accessories', 'Accessories'),
  ('dresses', 'Dresses'),
  ('activewear', 'Activewear');

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (allow all for now - we'll use app-level filtering)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on item_photos" ON item_photos FOR ALL USING (true) WITH CHECK (true);

-- Categories are public
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to categories" ON categories FOR SELECT USING (true);

-- Create simple function to ensure user exists
CREATE OR REPLACE FUNCTION ensure_user_row()
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO users (id, email, display_name)
  VALUES ('placeholder', 'placeholder@example.com', 'Placeholder User')
  ON CONFLICT (id) DO NOTHING;
$$;

-- Create indexes for performance
CREATE INDEX items_user_id_idx ON items(user_id);
CREATE INDEX items_category_id_idx ON items(category_id);
CREATE INDEX item_photos_item_id_idx ON item_photos(item_id);

-- Test that everything was created
SELECT 'Tables created successfully!' as status;
SELECT count(*) as category_count FROM categories;
