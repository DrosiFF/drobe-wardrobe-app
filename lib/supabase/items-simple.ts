import { supabase } from './client'

// Simplified service that definitely works
export class ItemsService {
  // Ensure user exists in the users table
  private async ensureUser(userId: string) {
    try {
      console.log('Ensuring user exists:', userId)
      
      // Simple insert with conflict handling
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: `${userId}@clerk.dev`,
          display_name: 'User'
        }, {
          onConflict: 'id'
        })

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error ensuring user:', error)
      } else {
        console.log('User ensured successfully')
      }
    } catch (error) {
      console.error('Error in ensureUser:', error)
    }
  }

  // Get all items for the current user
  async getItems(userId: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log('Getting items for user:', userId)

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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching items:', error)
      throw error
    }
    
    console.log('Retrieved items:', data)
    return data || []
  }

  // Delete an item
  async deleteItem(itemId: string, userId: string) {
    if (!userId || !itemId) {
      throw new Error('User ID and Item ID are required')
    }

    console.log('Deleting item:', itemId, 'for user:', userId)

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId) // Security: only delete items owned by this user

    if (error) {
      console.error('Error deleting item:', error)
      throw error
    }

    console.log('Item deleted successfully')
    return true
  }

  // Create a new item (simplified)
  async createItem(itemData: {
    name: string
    brand?: string
    description?: string
    color_tags?: string[]
    material?: string
    season?: string
    price_cents?: number
    category_slug?: string
    image_url?: string
  }, userId: string) {
    try {
      console.log('Creating item:', { itemData, userId })

      // Ensure user exists
      await this.ensureUser(userId)

      // Get category ID
      let category_id = null
      if (itemData.category_slug) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', itemData.category_slug)
          .single()
        
        category_id = categoryData?.id || null
      }

      // Insert item
      const { data, error } = await supabase
        .from('items')
        .insert({
          user_id: userId,
          name: itemData.name,
          brand: itemData.brand || null,
          description: itemData.description || null,
          color_tags: itemData.color_tags || [],
          material: itemData.material || null,
          season: itemData.season || null,
          price_cents: itemData.price_cents || null,
          category_id: category_id,
          source_label: 'vision'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating item:', error)
        throw error
      }

      console.log('Item created:', data)

      // Add photo if provided
      if (itemData.image_url && data) {
        const { error: photoError } = await supabase
          .from('item_photos')
          .insert({
            item_id: data.id,
            url: itemData.image_url
          })

        if (photoError) {
          console.warn('Photo creation failed:', photoError)
        }
      }

      return data
    } catch (error) {
      console.error('Error in createItem:', error)
      throw error
    }
  }

  // Helper method for upload compatibility
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
    console.log('Creating item from upload:', { analysisData, imageUrl, userId })

    // Convert blob URL to data URL for permanent storage
    let permanentImageUrl = imageUrl
    if (imageUrl.startsWith('blob:')) {
      try {
        permanentImageUrl = await this.blobToDataUrl(imageUrl)
        console.log('Converted blob to data URL')
      } catch (error) {
        console.warn('Failed to convert blob to data URL:', error)
        // Fallback to a placeholder
        permanentImageUrl = '/placeholder-item.jpg'
      }
    }

    // Map old category to new slug
    const categoryMapping: Record<string, string> = {
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

    const categorySlug = categoryMapping[analysisData.category || 'OTHER'] || 'accessories'

    return this.createItem({
      name: analysisData.type || 'Clothing Item',
      brand: analysisData.details?.brand,
      description: `AI analyzed item with ${analysisData.confidence}% confidence`,
      color_tags: analysisData.colors || [],
      material: analysisData.details?.material,
      season: analysisData.season?.[0],
      price_cents: analysisData.priceAnalysis?.estimatedPrice ? 
        Math.round(analysisData.priceAnalysis.estimatedPrice * 100) : undefined,
      category_slug: categorySlug,
      image_url: permanentImageUrl
    }, userId)
  }

  // Convert blob URL to data URL for permanent storage
  private async blobToDataUrl(blobUrl: string): Promise<string> {
    const response = await fetch(blobUrl)
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert blob to data URL'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Get categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }
}

export const itemsService = new ItemsService()
