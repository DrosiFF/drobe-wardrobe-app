'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Share2, 
  Download, 
  Heart, 
  Edit, 
  Trash2, 
  Calendar,
  Tag,
  Star,
  MapPin,
  Clock,
  Eye,
  Palette
} from 'lucide-react'
import { useToast } from '@/lib/stores/ui'
import ExportModal from '@/components/export/ExportModal'

interface ItemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: string
    name: string
    brand?: string
    category: string
    color?: string
    colors?: string[]
    season?: string
    seasons?: string[]
    occasion?: string
    occasions?: string[]
    price?: number
    imageUrl: string
    description?: string
    wornCount?: number
    lastWorn?: string
    tags?: string[]
    notes?: string
  } | null
}

export default function ItemDetailModal({ isOpen, onClose, item }: ItemDetailModalProps) {
  const [showExportModal, setShowExportModal] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'style'>('details')
  const itemRef = useRef<HTMLDivElement>(null)
  
  const { success, info } = useToast()

  if (!item) return null

  const handleShare = () => {
    setShowExportModal(true)
  }

  const handleEdit = () => {
    info('Edit Item', 'Edit functionality coming soon!')
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      success('Item Deleted', `${item.name} has been removed from your wardrobe`)
      onClose()
    }
  }

  const handleAddToOutfit = () => {
    info('Add to Outfit', 'Opening outfit builder...')
  }

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
    success(
      isFavorited ? 'Removed from Favorites' : 'Added to Favorites',
      `${item.name} ${isFavorited ? 'removed from' : 'added to'} your favorites`
    )
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: Tag },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'style', label: 'Style Tips', icon: Palette }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-panel border border-border rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{item.name}</h2>
                <p className="text-muted-foreground">{item.brand} • {item.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorited 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'hover:bg-accent/50 text-muted-foreground'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent/50 rounded-lg transition-colors text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(95vh-120px)]">
              {/* Image Section */}
              <div className="relative bg-gradient-to-br from-background to-accent/10">
                <div 
                  ref={itemRef}
                  className="h-full flex items-center justify-center p-8"
                >
                  <motion.img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                </div>
                
                {/* Quick Actions Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex gap-3">
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Share2 className="w-4 h-4" />
                      Share & Export
                    </button>
                    <button
                      onClick={handleAddToOutfit}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/90 transition-colors font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      Add to Outfit
                    </button>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-border">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {activeTab === 'details' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Price */}
                      {item.price && (
                        <div className="bg-accent/20 rounded-lg p-4">
                          <h3 className="font-semibold text-foreground mb-2">Estimated Value</h3>
                          <p className="text-2xl font-bold text-primary">${item.price}</p>
                        </div>
                      )}

                      {/* Colors */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Colors</h3>
                        <div className="flex gap-2">
                          {(item.colors || (item.color ? [item.color] : ['Unknown'])).map((color, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-border"
                                style={{ backgroundColor: color.toLowerCase() }}
                              />
                              <span className="text-sm text-muted-foreground capitalize">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Seasons & Occasions */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-foreground mb-3">Seasons</h3>
                          <div className="flex flex-wrap gap-2">
                            {(item.seasons || (item.season ? [item.season] : ['All Seasons'])).map((s, index) => (
                              <span key={index} className="tag-pill">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-3">Occasions</h3>
                          <div className="flex flex-wrap gap-2">
                            {(item.occasions || (item.occasion ? [item.occasion] : ['Casual'])).map((o, index) => (
                              <span key={index} className="tag-pill">
                                {o}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <div>
                          <h3 className="font-semibold text-foreground mb-3">Description</h3>
                          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                      )}

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-foreground mb-3">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag, index) => (
                              <span key={index} className="tag-pill">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'history' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-accent/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">Times Worn</h3>
                          </div>
                          <p className="text-2xl font-bold text-primary">{item.wornCount || 0}</p>
                        </div>
                        <div className="bg-accent/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">Last Worn</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.lastWorn ? new Date(item.lastWorn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Wear History</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                            <span className="text-sm text-muted-foreground">No wear history yet</span>
                            <button className="text-xs text-primary hover:underline">
                              Log Wear
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'style' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Style Suggestions</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-accent/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              This {item.category.toLowerCase()} pairs well with neutral bottoms and classic accessories.
                            </p>
                          </div>
                          <div className="p-3 bg-accent/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Perfect for {(item.occasions || (item.occasion ? [item.occasion] : ['casual'])).join(', ').toLowerCase()} occasions during {(item.seasons || (item.season ? [item.season] : ['all seasons'])).join(', ').toLowerCase()}.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Care Instructions</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            Machine wash cold
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            Tumble dry low
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            Iron on low heat if needed
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-border p-6">
                  <div className="flex gap-3">
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Export Modal */}
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            element={itemRef.current}
            data={{
              name: item.name,
              type: 'item',
              metadata: {
                item: item,
                brand: item.brand,
                category: item.category
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
