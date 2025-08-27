'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Plus,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Tag,
  Eye,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ItemCardProps {
  id: string
  name: string
  imageUrl: string
  category: string
  color?: string
  brand?: string
  price?: number
  tags?: string[]
  isFavorite?: boolean
  isSelected?: boolean
  onFavoriteToggle?: (id: string) => void
  onAddToOutfit?: (id: string) => void
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: () => void
}

export default function ItemCard({
  id,
  name,
  imageUrl,
  category,
  color,
  brand,
  price,
  tags = [],
  isFavorite = false,
  isSelected = false,
  onFavoriteToggle,
  onAddToOutfit,
  onSelect,
  onDelete,
  onClick,
}: ItemCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        onClick?.()
        break
      case 'f':
      case 'F':
        e.preventDefault()
        onFavoriteToggle?.(id)
        break
      case 'a':
      case 'A':
        e.preventDefault()
        onAddToOutfit?.(id)
        break
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`item-card group relative ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${name} - ${category}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-gradient-to-br from-accent to-muted/50">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={name}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
            <div className="text-center text-muted-foreground">
              <Tag className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs font-medium">{category}</p>
            </div>
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-background/90 hover:bg-background shadow-lg backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                onFavoriteToggle?.(id)
              }}
            >
              <Heart 
                className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-foreground'}`} 
              />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              onClick={(e) => {
                e.stopPropagation()
                onAddToOutfit?.(id)
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="tag-pill text-xs">
            {category.toLowerCase()}
          </span>
        </div>

        {/* Price Badge */}
        {price && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="tag-pill text-xs bg-primary/90 text-primary-foreground">
              ${price}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
              {name}
            </h3>
            {brand && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {brand}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onClick?.()}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddToOutfit?.(id)}>
                <Plus className="w-4 h-4 mr-2" />
                Add to Outfit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFavoriteToggle?.(id)}>
                <Heart className="w-4 h-4 mr-2" />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {color && (
            <span className="inline-flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full border border-border/50"
                style={{ backgroundColor: color.toLowerCase() }}
              />
              {color}
            </span>
          )}
          {tags.length > 0 && (
            <span className="truncate">
              {tags.slice(0, 2).join(', ')}
              {tags.length > 2 && '...'}
            </span>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus className="w-3 h-3 text-primary-foreground rotate-45" />
        </motion.div>
      )}
    </motion.div>
  )
}
