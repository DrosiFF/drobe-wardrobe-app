'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Grid, List, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TopBar from '@/components/TopBar'
import FiltersBar from '@/components/FiltersBar'
import ItemCard from '@/components/ItemCard'
import { useUser } from '@clerk/nextjs'
import { ItemsService } from '@/lib/supabase/items'
import { Database } from '@/lib/supabase/types'

type Item = Database['public']['Tables']['items']['Row']

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

  const itemsService = new ItemsService()

  // Load user's items when component mounts
  useEffect(() => {
    if (!isLoaded || !user) return

    const loadItems = async () => {
      try {
        setLoading(true)
        // Use the client-side user ID directly
        const userItems = await itemsService.getItems(user.id)
        setItems(userItems || [])
      } catch (error) {
        console.error('Error loading items:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [user, isLoaded])

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category)
      const matchesColor = selectedColors.length === 0 || selectedColors.some(color => 
        item.colors.some(itemColor => itemColor.toLowerCase().includes(color.toLowerCase()))
      )
      const matchesSeason = selectedSeasons.length === 0 || selectedSeasons.some(season =>
        item.seasons.includes(season) || item.seasons.includes('ALL')
      )

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

            {/* Add Item Button */}
            <Link href="/upload">
              <Button className="brand-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Items
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
          {loading ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
              <p className="text-muted-foreground">Loading your wardrobe...</p>
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
                    imageUrl={item.image_url}
                    category={item.category}
                    color={item.colors[0] || 'Unknown'}
                    brand={item.brand}
                    price={item.price ? Number(item.price) : undefined}
                    tags={item.tags}
                    isFavorite={favorites.has(item.id)}
                    isSelected={selectedItems.has(item.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onAddToOutfit={handleAddToOutfit}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

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