import { itemsService, outfitsService, authService } from '@/lib/supabase'

// Re-export Supabase services as database service
export const dbService = {
  items: itemsService,
  outfits: outfitsService,
  auth: authService
}

// Legacy interface for backward compatibility
export interface DatabaseService {
  items: typeof itemsService
  outfits: typeof outfitsService
  auth: typeof authService
}

// Factory function for backward compatibility
export function createDatabaseService(): DatabaseService {
  return dbService
}