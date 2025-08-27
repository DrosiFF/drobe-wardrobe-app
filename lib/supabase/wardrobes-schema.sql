-- Wardrobe Categories Schema Update
-- Run this in your Supabase SQL editor

-- Create wardrobes table
CREATE TABLE IF NOT EXISTS wardrobes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
  icon VARCHAR(50) DEFAULT 'shirt', -- Icon name for UI
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add wardrobe_id to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS wardrobe_id UUID REFERENCES wardrobes(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wardrobes_user_id ON wardrobes(user_id);
CREATE INDEX IF NOT EXISTS idx_items_wardrobe_id ON items(wardrobe_id);

-- Add RLS policies for wardrobes
ALTER TABLE wardrobes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wardrobes" ON wardrobes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wardrobes" ON wardrobes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobes" ON wardrobes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobes" ON wardrobes
  FOR DELETE USING (auth.uid() = user_id);

-- Create default wardrobe for existing users
INSERT INTO wardrobes (user_id, name, description, is_default)
SELECT id, 'Main Wardrobe', 'Your main clothing collection', true
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM wardrobes WHERE wardrobes.user_id = profiles.id
);

-- Update trigger for wardrobes
CREATE OR REPLACE FUNCTION update_wardrobes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wardrobes_updated_at
  BEFORE UPDATE ON wardrobes
  FOR EACH ROW
  EXECUTE FUNCTION update_wardrobes_updated_at();

-- Function to create default wardrobe for new users
CREATE OR REPLACE FUNCTION create_default_wardrobe()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wardrobes (user_id, name, description, is_default)
  VALUES (NEW.id, 'Main Wardrobe', 'Your main clothing collection', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default wardrobe when new user signs up
CREATE TRIGGER create_default_wardrobe_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_wardrobe();





