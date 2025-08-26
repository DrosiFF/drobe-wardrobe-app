import { supabase } from './client'
import { Database } from './types'

type Item = Database['public']['Tables']['items']['Row']
type ItemInsert = Database['public']['Tables']['items']['Insert']
type ItemUpdate = Database['public']['Tables']['items']['Update']

export class ItemsService {
  // Ensure user profile exists (auto-create if needed)
  private async ensureUserProfile(userId: string) {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (existingProfile) return // Profile already exists

      // Create profile if it doesn't exist
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: `user-${userId.slice(-6)}@example.com`, // Placeholder email
          full_name: 'New User'
        })

      if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating user profile:', insertError)
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    }
  }

  // Get all items for the current user
  async getItems(userId: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Get a single item by ID
  async getItem(id: string, userId: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  // Create a new item
  async createItem(item: ItemInsert, userId: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // First, ensure the user profile exists
    await this.ensureUserProfile(userId)

    const itemData: ItemInsert = {
      ...item,
      user_id: userId,
      colors: item.colors || [],
      seasons: item.seasons || [],
      occasions: item.occasions || [],
      tags: item.tags || [],
      worn_count: 0
    }

    const { data, error } = await supabase
      .from('items')
      .insert(itemData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update an item
  async updateItem(id: string, updates: ItemUpdate) {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete an item
  async deleteItem(id: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  // Increment wear count
  async recordWear(id: string) {
    const { data, error } = await supabase
      .from('items')
      .update({
        worn_count: supabase.sql`worn_count + 1`,
        last_worn: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Search items
  async searchItems(query: string, filters?: {
    category?: string
    colors?: string[]
    seasons?: string[]
    occasions?: string[]
  }) {
    let queryBuilder = supabase
      .from('items')
      .select('*')

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    // Apply filters
    if (filters?.category) {
      queryBuilder = queryBuilder.eq('category', filters.category)
    }

    if (filters?.colors && filters.colors.length > 0) {
      queryBuilder = queryBuilder.overlaps('colors', filters.colors)
    }

    if (filters?.seasons && filters.seasons.length > 0) {
      queryBuilder = queryBuilder.overlaps('seasons', filters.seasons)
    }

    if (filters?.occasions && filters.occasions.length > 0) {
      queryBuilder = queryBuilder.overlaps('occasions', filters.occasions)
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false })

    const { data, error } = await queryBuilder
    if (error) throw error
    return data
  }

  // Get analytics data
  async getAnalytics() {
    // Analytics temporarily disabled
    return {
      totalItems: 0,
      categoryStats: {},
      mostWorn: [],
      totalValue: 0
    }
  }
}

export const itemsService = new ItemsService()

