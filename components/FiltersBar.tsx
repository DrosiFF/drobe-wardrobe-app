'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shirt,
  Palette,
  Calendar,
  Tag,
  X,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface FiltersBarProps {
  isVisible: boolean
  selectedCategories: string[]
  selectedColors: string[]
  selectedSeasons: string[]
  onCategoryChange: (categories: string[]) => void
  onColorChange: (colors: string[]) => void
  onSeasonChange: (seasons: string[]) => void
  onClearAll: () => void
}

const categories: FilterOption[] = [
  { id: 'TOP', label: 'Tops', count: 12 },
  { id: 'BOTTOM', label: 'Bottoms', count: 8 },
  { id: 'DRESS', label: 'Dresses', count: 5 },
  { id: 'OUTERWEAR', label: 'Outerwear', count: 6 },
  { id: 'SHOES', label: 'Shoes', count: 10 },
  { id: 'ACCESSORY', label: 'Accessories', count: 15 },
]

const colors: FilterOption[] = [
  { id: 'black', label: 'Black' },
  { id: 'white', label: 'White' },
  { id: 'blue', label: 'Blue' },
  { id: 'red', label: 'Red' },
  { id: 'green', label: 'Green' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'pink', label: 'Pink' },
  { id: 'purple', label: 'Purple' },
]

const seasons: FilterOption[] = [
  { id: 'SPRING', label: 'Spring' },
  { id: 'SUMMER', label: 'Summer' },
  { id: 'FALL', label: 'Fall' },
  { id: 'WINTER', label: 'Winter' },
]

interface FilterDropdownProps {
  title: string
  icon: React.ReactNode
  options: FilterOption[]
  selected: string[]
  onChange: (values: string[]) => void
}

function FilterDropdown({ title, icon, options, selected, onChange }: FilterDropdownProps) {
  const handleToggle = (optionId: string) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter(id => id !== optionId)
      : [...selected, optionId]
    onChange(newSelected)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`filter-pill ${selected.length > 0 ? 'active' : ''}`}
        >
          {icon}
          <span className="ml-2">{title}</span>
          {selected.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
              {selected.length}
            </span>
          )}
          <ChevronDown className="ml-2 w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.id}
            checked={selected.includes(option.id)}
            onCheckedChange={() => handleToggle(option.id)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {option.count && (
              <span className="text-xs text-muted-foreground">
                {option.count}
              </span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function FiltersBar({
  isVisible,
  selectedCategories,
  selectedColors,
  selectedSeasons,
  onCategoryChange,
  onColorChange,
  onSeasonChange,
  onClearAll,
}: FiltersBarProps) {
  const hasActiveFilters = 
    selectedCategories.length > 0 || 
    selectedColors.length > 0 || 
    selectedSeasons.length > 0

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="border-b border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Filters</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="text-xs ghost-button"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <FilterDropdown
                title="Category"
                icon={<Shirt className="w-4 h-4" />}
                options={categories}
                selected={selectedCategories}
                onChange={onCategoryChange}
              />
              
              <FilterDropdown
                title="Color"
                icon={<Palette className="w-4 h-4" />}
                options={colors}
                selected={selectedColors}
                onChange={onColorChange}
              />
              
              <FilterDropdown
                title="Season"
                icon={<Calendar className="w-4 h-4" />}
                options={seasons}
                selected={selectedSeasons}
                onChange={onSeasonChange}
              />
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 pt-4 border-t border-border/30"
              >
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryId) => {
                    const category = categories.find(c => c.id === categoryId)
                    return (
                      <span
                        key={categoryId}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 text-primary rounded-md"
                      >
                        {category?.label}
                        <button
                          onClick={() => onCategoryChange(selectedCategories.filter(id => id !== categoryId))}
                          className="hover:bg-primary/30 rounded-sm p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                  
                  {selectedColors.map((colorId) => {
                    const color = colors.find(c => c.id === colorId)
                    return (
                      <span
                        key={colorId}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                      >
                        {color?.label}
                        <button
                          onClick={() => onColorChange(selectedColors.filter(id => id !== colorId))}
                          className="hover:bg-accent rounded-sm p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                  
                  {selectedSeasons.map((seasonId) => {
                    const season = seasons.find(s => s.id === seasonId)
                    return (
                      <span
                        key={seasonId}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent text-accent-foreground rounded-md"
                      >
                        {season?.label}
                        <button
                          onClick={() => onSeasonChange(selectedSeasons.filter(id => id !== seasonId))}
                          className="hover:bg-muted rounded-sm p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
