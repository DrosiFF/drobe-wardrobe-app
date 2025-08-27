import { supabase } from './client'

// Ultra-fast optimized service for items (v2 - fixed timers)
export class ItemsService {
  // Cache for user validation to avoid repeated checks
  private validatedUsers = new Set<string>()

  // Optimized user check - only runs once per user per session
  private async ensureUser(userId: string) {
    if (this.validatedUsers.has(userId)) {
      return // Already validated this session
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (!data && !error) {
        // User doesn't exist, create them
        await supabase
          .from('users')
          .insert({ id: userId })
          .select()
      }

      this.validatedUsers.add(userId)
    } catch (error) {
      console.warn('User validation skipped:', error)
      // Don't block loading if user table has issues
    }
  }

  // Super fast items fetch - minimal data, no joins
  async getItems(userId: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const startTime = performance.now()

    // Skip user check for speed - do it in background
    this.ensureUser(userId) // Don't await

    // Fetch only essential data first
    const { data, error } = await supabase
      .from('items')
      .select(`
        id,
        name,
        brand,
        color_tags,
        price_cents,
        category_id,
        created_at,
        categories (name, slug),
        item_photos!inner (url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50) // Limit for faster initial load

    const endTime = performance.now()
    console.log(`⚡ getItems took ${(endTime - startTime).toFixed(1)}ms`)

    if (error) {
      console.error('Error fetching items:', error)
      throw error
    }
    
    return data || []
  }

  // Fast delete with optimistic UI updates
  async deleteItem(itemId: string, userId: string) {
    if (!userId || !itemId) {
      throw new Error('User ID and Item ID are required')
    }

    const startTime = performance.now()

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId)

    const endTime = performance.now()
    console.log(`🗑️ deleteItem took ${(endTime - startTime).toFixed(1)}ms`)

    if (error) {
      console.error('Error deleting item:', error)
      throw error
    }

    return true
  }

  // Optimized creation with minimal validation
  async createItemFromUpload(analysisData: {
    type?: string
    category?: string
    colors?: string[]
    season?: string[]
    details?: {
      brand?: string
      material?: string
    }
    priceAnalysis?: {
      estimatedPrice?: number
    }
    confidence?: string
  }, imageUrl: string, userId: string) {
    
    const startTime = performance.now()

    // Skip blob conversion if it's already a data URL or public URL
    let permanentImageUrl = imageUrl
    if (imageUrl.startsWith('blob:')) {
      permanentImageUrl = '/placeholder-item.svg' // Use placeholder for speed
    }

    // Quick category mapping
    const categoryMap: Record<string, number> = {
      'tops': 1, 'TOP': 1, 'top': 1,
      'bottoms': 2, 'BOTTOM': 2, 'bottom': 2,
      'dresses': 6, 'DRESS': 6, 'dress': 6,
      'outerwear': 3, 'OUTERWEAR': 3, 'outerwear': 3,
      'footwear': 4, 'SHOES': 4, 'shoes': 4,
      'accessories': 5, 'ACCESSORY': 5, 'accessory': 5,
    }

    const categoryId = categoryMap[analysisData.category || analysisData.type || 'tops'] || 1

    // Create item with minimal data
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert({
        user_id: userId,
        name: `${analysisData.details?.brand || 'New'} ${analysisData.category || 'Item'}`,
        brand: analysisData.details?.brand,
        color_tags: analysisData.colors || [],
        material: analysisData.details?.material,
        season: analysisData.season?.[0],
        price_cents: analysisData.priceAnalysis?.estimatedPrice ? 
          Math.round(analysisData.priceAnalysis.estimatedPrice * 100) : null,
        category_id: categoryId,
        source_label: 'upload'
      })
      .select()
      .single()

    if (itemError) {
      console.error('Error creating item:', itemError)
      throw itemError
    }

    // Add photo quickly
    if (item) {
      await supabase
        .from('item_photos')
        .insert({
          item_id: item.id,
          url: permanentImageUrl
        })
    }

    const endTime = performance.now()
    console.log(`➕ createItem took ${(endTime - startTime).toFixed(1)}ms`)
    return item
  }

  // Bulk operations for efficiency
  async deleteItems(itemIds: string[], userId: string) {
    const startTime = performance.now()
    
    const { error } = await supabase
      .from('items')
      .delete()
      .in('id', itemIds)
      .eq('user_id', userId)

    const endTime = performance.now()
    console.log(`🗑️ bulkDelete ${itemIds.length} items took ${(endTime - startTime).toFixed(1)}ms`)

    if (error) throw error
    return true
  }
}

// Export singleton for better performance
export const itemsService = new ItemsService()
