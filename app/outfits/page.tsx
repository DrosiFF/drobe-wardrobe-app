'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Plus,
  Heart,
  Eye,
  Palette,
  Lightbulb,
  CheckCircle,
  Cloud
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import TopBar from '@/components/TopBar'
import { mockOutfits, mockItems } from '@/lib/mockData'

export default function OutfitsPage() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const handleFavoriteToggle = (outfitId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(outfitId)) {
        newFavorites.delete(outfitId)
      } else {
        newFavorites.add(outfitId)
      }
      return newFavorites
    })
  }

  const tips = [
    {
      icon: Palette,
      title: 'Color Coordination',
      description: 'Start with a base color and add complementary tones'
    },
    {
      icon: CheckCircle,
      title: 'Occasion Matching',
      description: 'Consider the event and dress appropriately'
    },
    {
      icon: Cloud,
      title: 'Weather Check',
      description: 'Match your outfit to the season and forecast'
    }
  ]

  return (
    <div className="min-h-screen">
      <TopBar />
      
      <div className="content-container py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="display-text mb-2">My Outfits</h1>
            <p className="text-muted-foreground">
              {mockOutfits.length} outfit{mockOutfits.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <Link href="/outfits/create">
            <Button className="brand-button">
              <Plus className="w-4 h-4 mr-2" />
              Create Outfit
            </Button>
          </Link>
        </motion.div>

        {/* Outfits Grid */}
        {mockOutfits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="text-center py-16 bg-card rounded-2xl border border-border/50"
          >
            <div className="space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Palette className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">No outfits yet</h3>
                <p className="text-muted-foreground">
                  Start creating amazing outfit combinations from your wardrobe items. 
                  Mix and match to discover your perfect style.
                </p>
              </div>
              <Link href="/outfits/create">
                <Button className="brand-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Outfit
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mockOutfits.map((outfit, index) => {
              const outfitItems = outfit.items.map(item => 
                mockItems.find(mockItem => mockItem.id === item.itemId)
              ).filter(Boolean)

              return (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                    delay: 0.2 + index * 0.1,
                  }}
                  className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-border transition-all duration-200 hover:scale-[1.02]"
                >
                  {/* Outfit Preview */}
                  <div className="aspect-square relative bg-secondary/30 p-4">
                    {outfitItems.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 h-full">
                        {outfitItems.slice(0, 4).map((item, itemIndex) => (
                          <div key={item?.id || itemIndex} className="relative overflow-hidden rounded-xl bg-background">
                            {item && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                        {outfitItems.length > 4 && (
                          <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-md border border-border/50">
                            +{outfitItems.length - 4} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Palette className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-background/90 hover:bg-background shadow-lg backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFavoriteToggle(outfit.id)
                          }}
                        >
                          <Heart 
                            className={`w-4 h-4 ${favorites.has(outfit.id) ? 'fill-red-500 text-red-500' : 'text-foreground'}`} 
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-background/90 hover:bg-background shadow-lg backdrop-blur-sm"
                        >
                          <Eye className="w-4 h-4 text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Outfit Info */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-foreground">{outfit.name}</h3>
                    
                    {outfit.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{outfit.notes}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{outfitItems.length} item{outfitItems.length !== 1 ? 's' : ''}</span>
                      <span>{new Date(outfit.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Item Tags */}
                    <div className="flex flex-wrap gap-1">
                      {outfitItems.slice(0, 3).map((item, itemIndex) => (
                        <span
                          key={item?.id || itemIndex}
                          className="tag-pill"
                        >
                          {item?.category.charAt(0) + item?.category.slice(1).toLowerCase()}
                        </span>
                      ))}
                      {outfitItems.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{outfitItems.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
          className="bg-gradient-to-br from-card to-accent/20 rounded-2xl p-8 border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Outfit Creation Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tips.map((tip, index) => {
              const Icon = tip.icon
              return (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                    delay: 0.6 + index * 0.1,
                  }}
                  className="flex items-start gap-3"
                >
                  <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground mb-1">{tip.title}</p>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}