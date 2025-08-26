// Supabase client and types
export { supabase } from './client'
export type { Database } from './types'

// Services
export { itemsService, ItemsService } from './items'
export { outfitsService, OutfitsService } from './outfits'
export { authService, AuthService } from './auth'
export { wardrobesService } from './wardrobes'

// Types
export type { OutfitWithItems } from './outfits'
export type { Wardrobe, WardrobeInsert, WardrobeUpdate } from './wardrobes'

