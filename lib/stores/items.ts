import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Category, Season, Occasion } from '@/lib/validators/api'

export interface Item {
  id: string
  name: string
  category: Category
  subCategory?: string
  brand?: string
  material?: string
  size?: string
  colors: string[]
  seasons: Season[]
  occasions: Occasion[]
  condition: string
  images: string[]
  notes?: string
  estimatedPriceCents?: number
  userNotes?: string
  wornCount: number
  createdAt: string
  updatedAt: string
}

export interface ItemFilters {
  category?: Category
  colors?: string[]
  seasons?: Season[]
  occasions?: Occasion[]
  brands?: string[]
  search?: string
  priceRange?: {
    min: number
    max: number
  }
}

interface ItemsState {
  // Items data
  items: Item[]
  isLoading: boolean
  error: string | null
  
  // Filters and view state
  filters: ItemFilters
  viewMode: 'grid' | 'list'
  sortBy: 'name' | 'category' | 'brand' | 'createdAt' | 'wornCount'
  sortOrder: 'asc' | 'desc'
  
  // Actions
  setItems: (items: Item[]) => void
  addItem: (item: Item) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  removeItem: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Filter actions
  setFilters: (filters: Partial<ItemFilters>) => void
  clearFilters: () => void
  setSearch: (search: string) => void
  
  // View actions
  setViewMode: (mode: 'grid' | 'list') => void
  setSorting: (sortBy: ItemsState['sortBy'], sortOrder: ItemsState['sortOrder']) => void
  
  // Computed getters
  getFilteredItems: () => Item[]
  getItemsByCategory: () => Record<Category, Item[]>
  getUniqueValues: () => {
    brands: string[]
    colors: string[]
    sizes: string[]
  }
}

export const useItemsStore = create<ItemsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        isLoading: false,
        error: null,
        
        filters: {},
        viewMode: 'grid',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        
        // Basic actions
        setItems: (items) => set({ items, error: null }),
        addItem: (item) => set((state) => ({ 
          items: [item, ...state.items] 
        })),
        updateItem: (id, updates) => set((state) => ({
          items: state.items.map((item) => 
            item.id === id ? { ...item, ...updates } : item
          )
        })),
        removeItem: (id) => set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        })),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        
        // Filter actions
        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),
        clearFilters: () => set({ filters: {} }),
        setSearch: (search) => set((state) => ({
          filters: { ...state.filters, search: search || undefined }
        })),
        
        // View actions
        setViewMode: (mode) => set({ viewMode: mode }),
        setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
        
        // Computed getters
        getFilteredItems: () => {
          const state = get()
          let filtered = [...state.items]
          
          // Apply filters
          if (state.filters.category) {
            filtered = filtered.filter(item => item.category === state.filters.category)
          }
          
          if (state.filters.colors && state.filters.colors.length > 0) {
            filtered = filtered.filter(item => 
              item.colors.some(color => state.filters.colors!.includes(color))
            )
          }
          
          if (state.filters.seasons && state.filters.seasons.length > 0) {
            filtered = filtered.filter(item => 
              item.seasons.some(season => state.filters.seasons!.includes(season))
            )
          }
          
          if (state.filters.occasions && state.filters.occasions.length > 0) {
            filtered = filtered.filter(item => 
              item.occasions.some(occasion => state.filters.occasions!.includes(occasion))
            )
          }
          
          if (state.filters.brands && state.filters.brands.length > 0) {
            filtered = filtered.filter(item => 
              item.brand && state.filters.brands!.includes(item.brand)
            )
          }
          
          if (state.filters.search) {
            const search = state.filters.search.toLowerCase()
            filtered = filtered.filter(item => 
              item.name.toLowerCase().includes(search) ||
              item.brand?.toLowerCase().includes(search) ||
              item.notes?.toLowerCase().includes(search) ||
              item.colors.some(color => color.toLowerCase().includes(search))
            )
          }
          
          if (state.filters.priceRange) {
            filtered = filtered.filter(item => {
              if (!item.estimatedPriceCents) return false
              const price = item.estimatedPriceCents / 100
              return price >= state.filters.priceRange!.min && 
                     price <= state.filters.priceRange!.max
            })
          }
          
          // Apply sorting
          filtered.sort((a, b) => {
            let aValue: any = a[state.sortBy]
            let bValue: any = b[state.sortBy]
            
            // Handle different data types
            if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase()
              bValue = bValue?.toLowerCase() || ''
            }
            
            if (state.sortBy === 'createdAt') {
              aValue = new Date(aValue).getTime()
              bValue = new Date(bValue).getTime()
            }
            
            let comparison = 0
            if (aValue < bValue) comparison = -1
            if (aValue > bValue) comparison = 1
            
            return state.sortOrder === 'desc' ? -comparison : comparison
          })
          
          return filtered
        },
        
        getItemsByCategory: () => {
          const items = get().getFilteredItems()
          const grouped: Record<string, Item[]> = {}
          
          items.forEach(item => {
            if (!grouped[item.category]) {
              grouped[item.category] = []
            }
            grouped[item.category].push(item)
          })
          
          return grouped as Record<Category, Item[]>
        },
        
        getUniqueValues: () => {
          const items = get().items
          const brands = new Set<string>()
          const colors = new Set<string>()
          const sizes = new Set<string>()
          
          items.forEach(item => {
            if (item.brand) brands.add(item.brand)
            item.colors.forEach(color => colors.add(color))
            if (item.size) sizes.add(item.size)
          })
          
          return {
            brands: Array.from(brands).sort(),
            colors: Array.from(colors).sort(),
            sizes: Array.from(sizes).sort()
          }
        }
      }),
      {
        name: 'drobe-items-store',
        // Only persist filters and view preferences, not the actual items
        partialize: (state) => ({
          filters: state.filters,
          viewMode: state.viewMode,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder
        })
      }
    ),
    {
      name: 'drobe-items-store'
    }
  )
)



