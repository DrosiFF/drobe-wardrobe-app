'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Grid, List, SortAsc, Trash2, CheckSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TopBar from '@/components/TopBar'
import FiltersBar from '@/components/FiltersBar'
import ItemCard from '@/components/ItemCard'
import ItemDetailModal from '@/components/ItemDetailModal'
import { useUser } from '@clerk/nextjs'
import { itemsService } from '@/lib/supabase/items-fast'
// Define the item type based on our new schema
type Item = {
  id: string
  user_id: string
  name: string
  brand?: string
  description?: string
  color_tags: string[]
  size_label?: string
  material?: string
  season?: string
  price_cents?: number
  currency: string
  category_id?: number
  source_label: string
  created_at: string
  updated_at: string
  categories?: {
    id: number
    name: string
    slug: string
  }
  item_photos: {
    id: string
    url: string
    width?: number
    height?: number
  }[]
}

export default function ItemsPage() {
  const { user, isLoaded } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())

  // Load user's items when component mounts
  useEffect(() => {
    if (!isLoaded || !user) return

    const loadItems = async () => {
      try {
        setLoading(true)
        
        // Load items immediately for fast UI
        const userItems = await itemsService.getItems(user.id)
        setItems(userItems || [])
        
        // Do migration in background (non-blocking)
        migrateLocalStorageItems(user.id).catch(console.warn)
        
      } catch (error) {
        console.error('Error loading items:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [user, isLoaded])

  // Helper function to migrate localStorage items to database
  const migrateLocalStorageItems = async (userId: string) => {
    try {
      const storageKey = `drobe-items-${userId}`
      const stored = localStorage.getItem(storageKey)
      
      if (!stored) return // No localStorage items to migrate
      
      const localItems = JSON.parse(stored)
      if (!Array.isArray(localItems) || localItems.length === 0) return
      
      console.log(`Found ${localItems.length} localStorage items to migrate:`, localItems)
      
      // Since blob URLs are expired and can't be migrated, let's skip migration
      // and just clear localStorage to start fresh with database
      console.log('Clearing localStorage items (blob URLs expired, starting fresh)')
      localStorage.removeItem(storageKey)
      console.log('✅ LocalStorage cleared! Ready for new database items.')
      
    } catch (error) {
      console.error('Error during migration:', error)
      // Try to clear localStorage anyway
      try {
        localStorage.removeItem(`drobe-items-${userId}`)
        console.log('LocalStorage cleared after error')
      } catch {}
    }
  }

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategories.length === 0 || 
        (item.categories && selectedCategories.includes(item.categories.slug)) ||
        (item.category && selectedCategories.includes(item.category.toLowerCase()))
      
      const matchesColor = selectedColors.length === 0 || selectedColors.some(color => 
        (item.color_tags || []).some(itemColor => itemColor.toLowerCase().includes(color.toLowerCase()))
      )
      
      const matchesSeason = selectedSeasons.length === 0 || 
        (item.season && selectedSeasons.includes(item.season)) ||
        (item.seasons && item.seasons.some(season => selectedSeasons.includes(season)))

      return matchesSearch && matchesCategory && matchesColor && matchesSeason
    })
  }, [items, searchQuery, selectedCategories, selectedColors, selectedSeasons])

  const handleFavoriteToggle = (itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId)
      } else {
        newFavorites.add(itemId)
      }
      return newFavorites
    })
  }

  const handleAddToOutfit = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId)
      } else {
        newSelected.add(itemId)
      }
      return newSelected
    })
  }

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(null)
  }

  // Delete single item
  const handleDeleteItem = async (itemId: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(prev => new Set([...prev, itemId]))
      await itemsService.deleteItem(itemId, user.id)
      
      // Remove from local state
      setItems(prev => prev.filter(item => item.id !== itemId))
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
      
      console.log('Item deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item. Please try again.')
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  // Bulk delete selected items
  const handleBulkDelete = async () => {
    if (!user || selectedItems.size === 0) return
    
    const count = selectedItems.size
    if (!confirm(`Are you sure you want to delete ${count} item${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleting(prev => new Set([...prev, ...selectedItems]))
      
      // Optimistic update - remove from UI immediately
      const itemsToDelete = Array.from(selectedItems)
      setItems(prev => prev.filter(item => !selectedItems.has(item.id)))
      setSelectedItems(new Set())
      setBulkSelectMode(false)
      
      // Delete in background using bulk delete
      if (itemsService.deleteItems) {
        await itemsService.deleteItems(itemsToDelete, user.id)
      } else {
        // Fallback to individual deletes
        await Promise.all(itemsToDelete.map(itemId => 
          itemsService.deleteItem(itemId, user.id)
        ))
      }
      
      console.log(`${count} items deleted successfully`)
    } catch (error) {
      console.error('Error bulk deleting items:', error)
      // Revert optimistic update on error
      window.location.reload()
    } finally {
      setDeleting(new Set())
    }
  }

  // Toggle bulk select mode
  const toggleBulkSelectMode = () => {
    setBulkSelectMode(!bulkSelectMode)
    setSelectedItems(new Set())
  }

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    }
  }

  // Toggle single item selection
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedColors([])
    setSelectedSeasons([])
  }

  const hasActiveFilters = 
    selectedCategories.length > 0 || 
    selectedColors.length > 0 || 
    selectedSeasons.length > 0

  return (
    <div className="min-h-screen">
      <TopBar
        onSearch={setSearchQuery}
        onFilterToggle={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      <FiltersBar
        isVisible={showFilters}
        selectedCategories={selectedCategories}
        selectedColors={selectedColors}
        selectedSeasons={selectedSeasons}
        onCategoryChange={setSelectedCategories}
        onColorChange={setSelectedColors}
        onSeasonChange={setSelectedSeasons}
        onClearAll={clearAllFilters}
      />

      <div className="content-container py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="display-text mb-2">Your Drobe</h1>
            <p className="text-muted-foreground">
              {loading ? 'Loading...' : `${filteredItems.length} of ${items.length} items`}
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-card rounded-lg border border-border/50 p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Bulk Select Toggle */}
              <Button
                variant={bulkSelectMode ? "default" : "outline"}
                size="sm"
                onClick={toggleBulkSelectMode}
                className="relative"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {bulkSelectMode ? 'Exit Select' : 'Select Items'}
                {selectedItems.size > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedItems.size}
                  </span>
                )}
              </Button>

              {/* Bulk Actions */}
              {bulkSelectMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllItems}
                    disabled={filteredItems.length === 0}
                  >
                    {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  
                  {selectedItems.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={deleting.size > 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}
                    </Button>
                  )}
                </>
              )}

              {/* Add Item Button */}
              <Link href="/upload">
                <Button className="brand-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Items
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
          {loading ? (
            <div className="items-grid">
              {/* Skeleton loaders for better UX */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-xl mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
              <div className="space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                  {hasActiveFilters ? (
                    <SortAsc className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    {hasActiveFilters ? 'No items match your filters' : 'No items yet'}
                  </h3>
                  <p className="text-muted-foreground">
                    {hasActiveFilters 
                      ? 'Try adjusting your search or filters to find more items.'
                      : 'Start building your digital wardrobe by adding your first clothing item.'
                    }
                  </p>
                </div>
                {hasActiveFilters ? (
                  <Button
                    variant="secondary"
                    onClick={clearAllFilters}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/upload">
                    <Button className="brand-button mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Item
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                    delay: index * 0.05,
                  }}
                >
                  <ItemCard
                    id={item.id}
                    name={item.name}
                    imageUrl={item.item_photos?.[0]?.url || item.image_url || '/placeholder-item.svg'}
                    category={item.categories?.name || item.category}
                    color={item.color_tags?.[0] || 'Unknown'}
                    brand={item.brand}
                    price={item.price_cents ? item.price_cents / 100 : undefined}
                    tags={item.color_tags || []}
                    isFavorite={favorites.has(item.id)}
                    isSelected={bulkSelectMode ? selectedItems.has(item.id) : false}
                    onFavoriteToggle={handleFavoriteToggle}
                    onAddToOutfit={handleAddToOutfit}
                    onSelect={bulkSelectMode ? handleSelectItem : undefined}
                    onDelete={handleDeleteItem}
                    onClick={bulkSelectMode ? () => handleSelectItem(item.id) : () => handleItemClick(item)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={showModal}
        onClose={handleCloseModal}
        item={selectedItem ? {
          id: selectedItem.id,
          name: selectedItem.name,
          brand: selectedItem.brand,
          category: selectedItem.categories?.name || selectedItem.category,
          color: selectedItem.color_tags?.[0],
          colors: selectedItem.color_tags,
          season: selectedItem.season,
          seasons: selectedItem.season ? [selectedItem.season] : [],
          occasion: undefined,
          occasions: [],
          price: selectedItem.price_cents ? selectedItem.price_cents / 100 : undefined,
          imageUrl: selectedItem.item_photos?.[0]?.url || selectedItem.image_url || '/placeholder-item.svg',
          description: selectedItem.description,
          wornCount: 0,
          lastWorn: undefined,
          tags: selectedItem.color_tags || [],
          notes: undefined
        } : null}
      />

      {/* Outfit Builder Tray */}
      {selectedItems.size > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-72 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 p-4 z-30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                {Array.from(selectedItems).slice(0, 5).map(itemId => {
                  const item = items.find(i => i.id === itemId)
                  return item ? (
                    <img
                      key={item.id}
                      src={item.image_url}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-border/50"
                    />
                  ) : null
                })}
                {selectedItems.size > 5 && (
                  <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
                    +{selectedItems.size - 5}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedItems(new Set())}
                className="ghost-button"
              >
                Clear
              </Button>
              <Button className="brand-button">
                Create Outfit
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}