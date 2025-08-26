import { supabase } from './client'
import { Database } from './types'

type Outfit = Database['public']['Tables']['outfits']['Row']
type OutfitInsert = Database['public']['Tables']['outfits']['Insert']
type OutfitUpdate = Database['public']['Tables']['outfits']['Update']
type OutfitItem = Database['public']['Tables']['outfit_items']['Row']
type OutfitItemInsert = Database['public']['Tables']['outfit_items']['Insert']

export interface OutfitWithItems extends Outfit {
  outfit_items: (OutfitItem & {
    items: Database['public']['Tables']['items']['Row']
  })[]
}

export class OutfitsService {
  // Get all outfits for the current user
  async getOutfits() {
    const { data, error } = await supabase
      .from('outfits')
      .select(`
        *,
        outfit_items (
          *,
          items (*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as OutfitWithItems[]
  }

  // Get a single outfit with items
  async getOutfit(id: string) {
    const { data, error } = await supabase
      .from('outfits')
      .select(`
        *,
        outfit_items (
          *,
          items (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as OutfitWithItems
  }

  // Create a new outfit
  async createOutfit(outfit: OutfitInsert, items?: OutfitItemInsert[]) {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Create outfit
    const { data: outfitData, error: outfitError } = await supabase
      .from('outfits')
      .insert({
        ...outfit,
        user_id: user.id,
        occasions: outfit.occasions || [],
        seasons: outfit.seasons || [],
        tags: outfit.tags || []
      })
      .select()
      .single()

    if (outfitError) throw outfitError

    // Add items to outfit if provided
    if (items && items.length > 0) {
      const outfitItems = items.map(item => ({
        ...item,
        outfit_id: outfitData.id
      }))

      const { error: itemsError } = await supabase
        .from('outfit_items')
        .insert(outfitItems)

      if (itemsError) throw itemsError
    }

    return outfitData
  }

  // Update an outfit
  async updateOutfit(id: string, updates: OutfitUpdate) {
    const { data, error } = await supabase
      .from('outfits')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete an outfit
  async deleteOutfit(id: string) {
    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  // Add item to outfit
  async addItemToOutfit(outfitId: string, itemData: Omit<OutfitItemInsert, 'outfit_id'>) {
    const { data, error } = await supabase
      .from('outfit_items')
      .insert({
        ...itemData,
        outfit_id: outfitId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Remove item from outfit
  async removeItemFromOutfit(outfitId: string, itemId: string) {
    const { error } = await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', outfitId)
      .eq('item_id', itemId)

    if (error) throw error
    return true
  }

  // Update item position in outfit
  async updateItemPosition(
    outfitId: string, 
    itemId: string, 
    position: { x: number; y: number; scale?: number; zIndex?: number }
  ) {
    const { data, error } = await supabase
      .from('outfit_items')
      .update({
        position_x: position.x,
        position_y: position.y,
        scale: position.scale,
        z_index: position.zIndex
      })
      .eq('outfit_id', outfitId)
      .eq('item_id', itemId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Record outfit wear
  async recordWear(id: string) {
    const { data, error } = await supabase
      .from('outfits')
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

  // Toggle favorite status
  async toggleFavorite(id: string) {
    // First get current status
    const { data: outfit, error: getError } = await supabase
      .from('outfits')
      .select('is_favorite')
      .eq('id', id)
      .single()

    if (getError) throw getError

    // Toggle the status
    const { data, error } = await supabase
      .from('outfits')
      .update({ is_favorite: !outfit.is_favorite })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Search outfits
  async searchOutfits(query: string, filters?: {
    occasions?: string[]
    seasons?: string[]
    isFavorite?: boolean
  }) {
    let queryBuilder = supabase
      .from('outfits')
      .select(`
        *,
        outfit_items (
          *,
          items (*)
        )
      `)

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    // Apply filters
    if (filters?.occasions && filters.occasions.length > 0) {
      queryBuilder = queryBuilder.overlaps('occasions', filters.occasions)
    }

    if (filters?.seasons && filters.seasons.length > 0) {
      queryBuilder = queryBuilder.overlaps('seasons', filters.seasons)
    }

    if (filters?.isFavorite !== undefined) {
      queryBuilder = queryBuilder.eq('is_favorite', filters.isFavorite)
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false })

    const { data, error } = await queryBuilder
    if (error) throw error
    return data as OutfitWithItems[]
  }
}

export const outfitsService = new OutfitsService()




