export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          preferences: Json | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          name: string
          image_url: string
          bg_removed_url: string | null
          category: 'TOP' | 'BOTTOM' | 'DRESS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORY' | 'BAG' | 'HAT' | 'OTHER'
          brand: string | null
          colors: string[]
          fabric: string | null
          seasons: string[]
          occasions: string[]
          price: number | null
          tags: string[]
          description: string | null
          worn_count: number
          last_worn: string | null
          notes: string | null
          ai_analysis: Json | null
          wardrobe_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          name: string
          image_url: string
          bg_removed_url?: string | null
          category: 'TOP' | 'BOTTOM' | 'DRESS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORY' | 'BAG' | 'HAT' | 'OTHER'
          brand?: string | null
          colors?: string[]
          fabric?: string | null
          seasons?: string[]
          occasions?: string[]
          price?: number | null
          tags?: string[]
          description?: string | null
          worn_count?: number
          last_worn?: string | null
          notes?: string | null
          ai_analysis?: Json | null
          wardrobe_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          image_url?: string
          bg_removed_url?: string | null
          category?: 'TOP' | 'BOTTOM' | 'DRESS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORY' | 'BAG' | 'HAT' | 'OTHER'
          brand?: string | null
          colors?: string[]
          fabric?: string | null
          seasons?: string[]
          occasions?: string[]
          price?: number | null
          tags?: string[]
          description?: string | null
          worn_count?: number
          last_worn?: string | null
          notes?: string | null
          ai_analysis?: Json | null
          wardrobe_id?: string | null
        }
      }
      wardrobes: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          color: string
          icon: string
          is_default: boolean
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          is_default?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          is_default?: boolean
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          occasions: string[]
          seasons: string[]
          tags: string[]
          image_url: string | null
          is_favorite: boolean
          worn_count: number
          last_worn: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          occasions?: string[]
          seasons?: string[]
          tags?: string[]
          image_url?: string | null
          is_favorite?: boolean
          worn_count?: number
          last_worn?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          occasions?: string[]
          seasons?: string[]
          tags?: string[]
          image_url?: string | null
          is_favorite?: boolean
          worn_count?: number
          last_worn?: string | null
        }
      }
      outfit_items: {
        Row: {
          id: string
          outfit_id: string
          item_id: string
          position_x: number
          position_y: number
          scale: number
          z_index: number
          created_at: string
        }
        Insert: {
          id?: string
          outfit_id: string
          item_id: string
          position_x?: number
          position_y?: number
          scale?: number
          z_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          outfit_id?: string
          item_id?: string
          position_x?: number
          position_y?: number
          scale?: number
          z_index?: number
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          date: string
          outfit_id: string | null
          title: string
          description: string | null
          type: 'outfit_plan' | 'purchase' | 'laundry' | 'event'
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          date: string
          outfit_id?: string | null
          title: string
          description?: string | null
          type: 'outfit_plan' | 'purchase' | 'laundry' | 'event'
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          date?: string
          outfit_id?: string | null
          title?: string
          description?: string | null
          type?: 'outfit_plan' | 'purchase' | 'laundry' | 'event'
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          item_id: string | null
          name: string
          brand: string | null
          price: number
          purchase_date: string
          store: string | null
          category: string
          image_url: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          item_id?: string | null
          name: string
          brand?: string | null
          price: number
          purchase_date: string
          store?: string | null
          category: string
          image_url?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          item_id?: string | null
          name?: string
          brand?: string | null
          price?: number
          purchase_date?: string
          store?: string | null
          category?: string
          image_url?: string | null
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

