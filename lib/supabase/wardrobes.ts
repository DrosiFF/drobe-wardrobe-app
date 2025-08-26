import { supabase } from './client'
import type { Database } from './types'
// import { getCurrentUserId } from '@/lib/auth/user' // Disabled

type Wardrobe = Database['public']['Tables']['wardrobes']['Row']
type WardrobeInsert = Database['public']['Tables']['wardrobes']['Insert']
type WardrobeUpdate = Database['public']['Tables']['wardrobes']['Update']

export const wardrobesService = {
  // Get all wardrobes for current user
  async getUserWardrobes(userId?: string) {
    // Temporarily disable auth requirement
    // const currentUserId = userId || await getCurrentUserId()
    // if (!currentUserId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('wardrobes')
      .select('*')
      // .eq('user_id', currentUserId)
      .order('is_default', { ascending: false })
      .order('name')

    if (error) {
      console.error('Error fetching wardrobes:', error)
      throw error
    }

    return data || []
  },

  // Get default wardrobe
  async getDefaultWardrobe() {
    const { data, error } = await supabase
      .from('wardrobes')
      .select('*')
      .eq('is_default', true)
      .single()

    if (error) {
      console.error('Error fetching default wardrobe:', error)
      throw error
    }

    return data
  },

  // Create new wardrobe
  async createWardrobe(wardrobe: Omit<WardrobeInsert, 'user_id'>, userId?: string) {
    // Auth temporarily disabled
    // const currentUserId = userId || await getCurrentUserId()
    // if (!currentUserId) throw new Error('User not authenticated')
    const currentUserId = userId || 'mock-user'

    const { data, error } = await supabase
      .from('wardrobes')
      .insert({
        ...wardrobe,
        user_id: currentUserId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating wardrobe:', error)
      throw error
    }

    return data
  },

  // Update wardrobe
  async updateWardrobe(id: string, updates: WardrobeUpdate) {
    const { data, error } = await supabase
      .from('wardrobes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating wardrobe:', error)
      throw error
    }

    return data
  },

  // Delete wardrobe
  async deleteWardrobe(id: string) {
    // Don't allow deleting default wardrobe
    const wardrobe = await supabase
      .from('wardrobes')
      .select('is_default')
      .eq('id', id)
      .single()

    if (wardrobe.data?.is_default) {
      throw new Error('Cannot delete default wardrobe')
    }

    const { error } = await supabase
      .from('wardrobes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting wardrobe:', error)
      throw error
    }

    return true
  },

  // Get wardrobe with item count
  async getWardrobeWithItemCount(id: string) {
    const { data, error } = await supabase
      .from('wardrobes')
      .select(`
        *,
        items(count)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching wardrobe with items:', error)
      throw error
    }

    return data
  },

  // Get items in a wardrobe
  async getWardrobeItems(wardrobeId: string) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('wardrobe_id', wardrobeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wardrobe items:', error)
      throw error
    }

    return data || []
  }
}

export type { Wardrobe, WardrobeInsert, WardrobeUpdate }
