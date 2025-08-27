import { supabase } from './client'
import { useUser } from '@clerk/nextjs'

// Updated service to work with the new database schema
export class ItemsService {
  // Ensure user exists in the users table
  private async ensureUser(userId: string) {
    try {
      // Call the ensure_user_row function we created in the schema
      const { error } = await supabase.rpc('ensure_user_row')
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error ensuring user:', error)
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error)
    }
  }

  // Get all items for the current user
  async getItems(userId: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Ensure user exists first
    await this.ensureUser(userId)

    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        category_id,
        categories (
          id,
          name,
          slug
        ),
        item_photos (
          id,
          url,
          width,
          height
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching items:', error)
      throw error
    }
    return data || []
  }

  // Get a single item by ID
  async getItem(id: string, userId: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        item_photos (
          id,
          url,
          width,
          height
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  // Create a new item
  async createItem(itemData: {
    name: string
    brand?: string
    description?: string
    color_tags?: string[]
    size_label?: string
    material?: string
    season?: string
    price_cents?: number
    currency?: string
    category_slug?: string
    source_label?: string
    image_url?: string
  }, userId: string) {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      console.log('Creating item with data:', { itemData, userId })

      // Ensure user exists first
      await this.ensureUser(userId)
      console.log('User ensured')

      // Get category ID from slug if provided
      let category_id = null
      if (itemData.category_slug) {
        console.log('Looking up category:', itemData.category_slug)
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', itemData.category_slug)
          .single()
        
        if (categoryError) {
          console.warn('Category lookup error:', categoryError)
        }
        
        category_id = categoryData?.id || null
        console.log('Category ID found:', category_id)
      }

      const insertData = {
        user_id: userId,
        name: itemData.name,
        brand: itemData.brand || null,
        description: itemData.description || null,
        color_tags: itemData.color_tags || [],
        size_label: itemData.size_label || null,
        material: itemData.material || null,
        season: itemData.season || null,
        price_cents: itemData.price_cents || null,
        currency: itemData.currency || 'USD',
        category_id: category_id,
        source_label: itemData.source_label || 'manual'
      }

      console.log('Inserting item with data:', insertData)

      const { data, error } = await supabase
        .from('items')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        throw error
      }

      console.log('Item created successfully:', data)

      // Add photo if provided
      if (itemData.image_url && data) {
        console.log('Adding photo:', itemData.image_url)
        try {
          await this.addItemPhoto(data.id, itemData.image_url)
          console.log('Photo added successfully')
        } catch (photoError) {
          console.error('Photo add error:', photoError)
          // Don't fail the whole operation if photo fails
        }
      }

      return data
    } catch (error) {
      console.error('Error in createItem:', error)
      throw error
    }
  }

  // Add a photo to an item
  async addItemPhoto(itemId: string, imageUrl: string, width?: number, height?: number) {
    const { data, error } = await supabase
      .from('item_photos')
      .insert({
        item_id: itemId,
        url: imageUrl,
        width: width || null,
        height: height || null
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update an item
  async updateItem(id: string, updates: {
    name?: string
    brand?: string
    description?: string
    color_tags?: string[]
    size_label?: string
    material?: string
    season?: string
    price_cents?: number
    currency?: string
    category_slug?: string
  }) {
    // Get category ID from slug if provided
    let category_id = undefined
    if (updates.category_slug) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', updates.category_slug)
        .single()
      
      category_id = categoryData?.id || null
    }

    const updateData = { ...updates }
    delete updateData.category_slug
    if (category_id !== undefined) {
      updateData.category_id = category_id
    }

    const { data, error } = await supabase
      .from('items')
      .update(updateData)
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

  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }

  // Map old category format to new category slug
  private mapCategoryToSlug(oldCategory: string): string {
    const mapping: Record<string, string> = {
      'TOP': 'tops',
      'BOTTOM': 'bottoms',
      'DRESS': 'dresses',
      'OUTERWEAR': 'outerwear',
      'SHOES': 'footwear',
      'ACCESSORY': 'accessories',
      'BAG': 'accessories',
      'HAT': 'accessories',
      'OTHER': 'accessories'
    }
    return mapping[oldCategory] || 'accessories'
  }

  // Helper method for compatibility with existing upload code
  async createItemFromUpload(analysisData: {
    type?: string
    category?: string
    colors?: string[]
    season?: string[]
    occasion?: string[]
    details?: {
      brand?: string
      material?: string
    }
    priceAnalysis?: {
      estimatedPrice?: number
    }
    confidence?: string
  }, imageUrl: string, userId: string) {
    try {
      console.log('Creating item from upload with data:', { analysisData, imageUrl, userId })
      
      const categorySlug = this.mapCategoryToSlug(analysisData.category || 'OTHER')
      
      const result = await this.createItem({
        name: analysisData.type || 'Clothing Item',
        brand: analysisData.details?.brand,
        description: `AI analyzed item with ${analysisData.confidence}% confidence`,
        color_tags: analysisData.colors || [],
        material: analysisData.details?.material,
        season: analysisData.season?.[0],
        price_cents: analysisData.priceAnalysis?.estimatedPrice ? Math.round(analysisData.priceAnalysis.estimatedPrice * 100) : undefined,
        category_slug: categorySlug,
        source_label: 'vision',
        image_url: imageUrl
      }, userId)
      
      console.log('Successfully created item:', result)
      return result
    } catch (error) {
      console.error('Error in createItemFromUpload:', error)
      throw error
    }
  }
}

export const itemsService = new ItemsService()
