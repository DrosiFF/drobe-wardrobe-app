import { supabase } from './client'

// Ultra-simple fallback service that stores items in localStorage
// and also tries to sync to any available Supabase table
export class ItemsService {
  private storageKey = 'drobe-items'

  // Get items from localStorage
  async getItems(userId: string): Promise<any[]> {
    try {
      console.log('Getting items for user:', userId)
      
      // First try localStorage
      const stored = localStorage.getItem(`${this.storageKey}-${userId}`)
      const localItems = stored ? JSON.parse(stored) : []
      
      console.log('Items from localStorage:', localItems)
      return localItems
    } catch (error) {
      console.error('Error getting items:', error)
      return []
    }
  }

  // Save item to localStorage (and try Supabase if available)
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
    try {
      console.log('Creating item from upload:', { analysisData, imageUrl, userId })

      // Convert blob URL to data URL for permanent storage
      let permanentImageUrl = imageUrl
      if (imageUrl.startsWith('blob:')) {
        try {
          permanentImageUrl = await this.blobToDataUrl(imageUrl)
          console.log('Converted blob to data URL for localStorage')
        } catch (error) {
          console.warn('Failed to convert blob to data URL:', error)
          permanentImageUrl = '/placeholder-item.svg'
        }
      }

      // Create item object
      const item = {
        id: this.generateId(),
        user_id: userId,
        name: analysisData.type || 'Clothing Item',
        brand: analysisData.details?.brand || null,
        description: `AI analyzed item with ${analysisData.confidence}% confidence`,
        color_tags: analysisData.colors || [],
        material: analysisData.details?.material || null,
        season: analysisData.season?.[0] || null,
        price_cents: analysisData.priceAnalysis?.estimatedPrice ? 
          Math.round(analysisData.priceAnalysis.estimatedPrice * 100) : null,
        category: analysisData.category || 'OTHER',
        image_url: permanentImageUrl,
        created_at: new Date().toISOString(),
        item_photos: [{
          id: this.generateId(),
          url: permanentImageUrl,
          width: null,
          height: null
        }]
      }

      // Save to localStorage
      const storageKey = `${this.storageKey}-${userId}`
      const existingItems = this.getLocalItems(userId)
      existingItems.push(item)
      localStorage.setItem(storageKey, JSON.stringify(existingItems))

      console.log('Item saved to localStorage:', item)

      // Try to save to Supabase if possible (but don't fail if it doesn't work)
      try {
        await this.trySupabaseSave(item)
      } catch (supabaseError) {
        console.warn('Supabase save failed (using localStorage only):', supabaseError)
      }

      return item
    } catch (error) {
      console.error('Error creating item:', error)
      throw error
    }
  }

  private getLocalItems(userId: string): any[] {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-${userId}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
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

  private async trySupabaseSave(item: any) {
    // Try to save to any available table structure
    // This will fail silently if tables don't exist
    try {
      // Try the new schema first
      await supabase.from('items').insert(item)
    } catch {
      try {
        // Try the old schema
        await supabase.from('profiles').select('id').limit(1)
        // If profiles table exists, it might be the old schema
        const oldFormatItem = {
          user_id: item.user_id,
          name: item.name,
          image_url: item.image_url,
          category: item.category,
          brand: item.brand,
          colors: item.color_tags,
          seasons: item.season ? [item.season] : [],
          occasions: ['CASUAL'],
          tags: [],
          description: item.description,
          worn_count: 0,
          price: item.price_cents ? item.price_cents / 100 : null
        }
        await supabase.from('items').insert(oldFormatItem)
      } catch {
        // Both failed, that's okay - we're using localStorage
        console.log('Using localStorage only (Supabase not available)')
      }
    }
  }

  // Dummy methods for compatibility
  async getCategories() {
    return [
      { id: 1, slug: 'tops', name: 'Tops' },
      { id: 2, slug: 'bottoms', name: 'Bottoms' },
      { id: 3, slug: 'outerwear', name: 'Outerwear' },
      { id: 4, slug: 'footwear', name: 'Footwear' },
      { id: 5, slug: 'accessories', name: 'Accessories' },
      { id: 6, slug: 'dresses', name: 'Dresses' },
      { id: 7, slug: 'activewear', name: 'Activewear' }
    ]
  }
}

export const itemsService = new ItemsService()
