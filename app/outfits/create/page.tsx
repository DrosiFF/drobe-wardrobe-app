'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/lib/stores/ui'
import { 
  Plus, 
  Save, 
  X, 
  Shirt, 
  Palette, 
  Tag, 
  Calendar,
  MapPin,
  Search,
  Filter,
  Grid3X3,
  LayoutGrid,
  Eye,
  Heart,
  Share2
} from 'lucide-react'
import ExportModal from '@/components/export/ExportModal'
import TopBar from '@/components/TopBar'
import { mockItems } from '@/lib/mockData'

interface OutfitItem {
  id: string
  itemId: string
  x: number
  y: number
  scale: number
  zIndex: number
}

interface OutfitDetails {
  name: string
  occasion: string[]
  season: string[]
  description: string
  tags: string[]
}

export default function CreateOutfitPage() {
  const router = useRouter()
  
  // Outfit canvas state
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Outfit details state
  const [outfitDetails, setOutfitDetails] = useState<OutfitDetails>({
    name: '',
    occasion: [],
    season: [],
    description: '',
    tags: []
  })
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [showOutfitForm, setShowOutfitForm] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isClosetPanelOpen, setIsClosetPanelOpen] = useState(true)
  
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Filter closet items
  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.brand ? item.brand.toLowerCase() : '').includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })
  
  // Add item to outfit canvas
  const addItemToOutfit = useCallback((itemId: string) => {
    const newOutfitItem: OutfitItem = {
      id: `outfit-${Date.now()}-${Math.random()}`,
      itemId,
      x: 250 + Math.random() * 200, // Random position in center area
      y: 150 + Math.random() * 200,
      scale: 1,
      zIndex: outfitItems.length + 1
    }
    setOutfitItems(prev => [...prev, newOutfitItem])
  }, [outfitItems.length])
  
  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent, itemId: string) => {
    e.preventDefault()
    setSelectedItem(itemId)
    setIsDragging(true)
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const item = outfitItems.find(i => i.id === itemId)
    if (!item) return
    
    setDragOffset({
      x: e.clientX - rect.left - item.x,
      y: e.clientY - rect.top - item.y
    })
  }, [outfitItems])
  
  // Handle drag move
  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedItem) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y
    
    setOutfitItems(prev => prev.map(item => 
      item.id === selectedItem 
        ? { ...item, x: Math.max(0, Math.min(newX, canvas.offsetWidth - 120)), 
                     y: Math.max(0, Math.min(newY, canvas.offsetHeight - 120)) }
        : item
    ))
  }, [isDragging, selectedItem, dragOffset])
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setSelectedItem(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])
  
  // Remove item from outfit
  const removeItemFromOutfit = useCallback((itemId: string) => {
    setOutfitItems(prev => prev.filter(item => item.id !== itemId))
  }, [])
  
  // Scale item
  const scaleItem = useCallback((itemId: string, newScale: number) => {
    setOutfitItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, scale: Math.max(0.5, Math.min(2, newScale)) } : item
    ))
  }, [])
  
  // Notification state
  const { success, error } = useToast()

  // Save outfit
  const saveOutfit = async () => {
    if (!outfitDetails.name.trim()) {
      error('Missing Outfit Name', 'Please enter an outfit name')
      return
    }
    
    if (outfitItems.length === 0) {
      error('No Items Selected', 'Please add at least one item to your outfit')
      return
    }
    
    // Here you would save to your backend/database
    console.log('Saving outfit:', {
      details: outfitDetails,
      items: outfitItems
    })
    
    success('Outfit Saved!', 'Your outfit has been saved successfully')
    setTimeout(() => {
      router.push('/outfits')
    }, 1500)
  }
  
  const categories = ['ALL', 'TOP', 'BOTTOM', 'DRESS', 'OUTERWEAR', 'SHOES', 'ACCESSORY']
  const occasions = ['Casual', 'Work', 'Party', 'Date Night', 'Sport', 'Travel', 'Formal']
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter']

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      
      <div className="flex flex-1">
        {/* Closet Panel */}
        <AnimatePresence>
          {isClosetPanelOpen && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-96 bg-panel border-r border-border/50 flex flex-col"
            >
              {/* Closet Header */}
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Your Closet</h2>
                  <button
                    onClick={() => setIsClosetPanelOpen(false)}
                    className="p-2 hover:bg-elev rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search your items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setFilterCategory(category)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filterCategory === category
                          ? 'bg-brand text-background'
                          : 'bg-elev text-muted-foreground hover:bg-muted/10'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Closet Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {filteredItems.map(item => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="card-base cursor-pointer group"
                      onClick={() => addItemToOutfit(item.id)}
                    >
                      <div className="aspect-square bg-elev rounded-lg mb-2 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs bg-elev px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <Plus className="w-4 h-4 text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <div className="p-6 border-b border-border/50 bg-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!isClosetPanelOpen && (
                  <button
                    onClick={() => setIsClosetPanelOpen(true)}
                    className="brand-button"
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Open Closet
                  </button>
                )}
                <div>
                  <h1 className="display-text">Create Outfit</h1>
                  <p className="text-muted-foreground">
                    {outfitItems.length} items • Drag items to arrange your outfit
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowOutfitForm(true)}
                  className="px-4 py-2 bg-elev text-foreground rounded-lg hover:bg-muted/10 transition-colors flex items-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Add Details
                </button>
                <button
                  onClick={saveOutfit}
                  className="brand-button"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Outfit
                </button>
                
                <button
                  onClick={() => setShowExportModal(true)}
                  className="ghost-button border border-border"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Export & Share
                </button>
              </div>
            </div>
          </div>
          
          {/* Outfit Canvas */}
          <div 
            ref={canvasRef}
            className="flex-1 relative bg-gradient-to-br from-background via-background/95 to-panel overflow-hidden"
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            {/* Canvas Grid */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-12 h-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="border-r border-foreground" />
                ))}
              </div>
            </div>
            
            {/* Outfit Items */}
            <AnimatePresence>
              {outfitItems.map(outfitItem => {
                const item = mockItems.find(i => i.id === outfitItem.itemId)
                if (!item) return null
                
                return (
                  <motion.div
                    key={outfitItem.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: outfitItem.scale, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{
                      position: 'absolute',
                      left: outfitItem.x,
                      top: outfitItem.y,
                      zIndex: outfitItem.zIndex,
                      cursor: isDragging && selectedItem === outfitItem.id ? 'grabbing' : 'grab'
                    }}
                    className={`group ${selectedItem === outfitItem.id ? 'ring-2 ring-brand' : ''}`}
                    onMouseDown={(e) => handleDragStart(e, outfitItem.id)}
                  >
                    <div className="relative">
                      <div className="w-28 h-28 bg-elev rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                      
                      {/* Item Controls */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => removeItemFromOutfit(outfitItem.id)}
                          className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Scale Controls */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 bg-background/90 rounded-lg px-2 py-1 shadow-lg">
                          <button
                            onClick={() => scaleItem(outfitItem.id, outfitItem.scale - 0.1)}
                            className="w-5 h-5 bg-elev rounded text-xs hover:bg-muted/10 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono w-8 text-center">
                            {Math.round(outfitItem.scale * 100)}%
                          </span>
                          <button
                            onClick={() => scaleItem(outfitItem.id, outfitItem.scale + 0.1)}
                            className="w-5 h-5 bg-elev rounded text-xs hover:bg-muted/10 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Item Label */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-background/90 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {/* Empty State */}
            {outfitItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Palette className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Building Your Outfit</h3>
                  <p className="text-muted-foreground mb-4">
                    Select items from your closet to create the perfect look
                  </p>
                  {!isClosetPanelOpen && (
                    <button
                      onClick={() => setIsClosetPanelOpen(true)}
                      className="brand-button"
                    >
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      Open Closet
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Outfit Details Modal */}
      <AnimatePresence>
        {showOutfitForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowOutfitForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-base max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Outfit Details</h3>
                <button
                  onClick={() => setShowOutfitForm(false)}
                  className="p-2 hover:bg-elev rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Outfit Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Outfit Name *</label>
                  <input
                    type="text"
                    value={outfitDetails.name}
                    onChange={(e) => setOutfitDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Summer Beach Vibes"
                    className="input-field"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={outfitDetails.description}
                    onChange={(e) => setOutfitDetails(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this outfit..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                
                {/* Occasions */}
                <div>
                  <label className="block text-sm font-medium mb-2">Occasions</label>
                  <div className="flex flex-wrap gap-2">
                    {occasions.map(occasion => (
                      <button
                        key={occasion}
                        onClick={() => {
                          setOutfitDetails(prev => ({
                            ...prev,
                            occasion: prev.occasion.includes(occasion)
                              ? prev.occasion.filter(o => o !== occasion)
                              : [...prev.occasion, occasion]
                          }))
                        }}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          outfitDetails.occasion.includes(occasion)
                            ? 'bg-brand text-background'
                            : 'bg-elev text-muted-foreground hover:bg-muted/10'
                        }`}
                      >
                        {occasion}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Seasons */}
                <div>
                  <label className="block text-sm font-medium mb-2">Seasons</label>
                  <div className="flex flex-wrap gap-2">
                    {seasons.map(season => (
                      <button
                        key={season}
                        onClick={() => {
                          setOutfitDetails(prev => ({
                            ...prev,
                            season: prev.season.includes(season)
                              ? prev.season.filter(s => s !== season)
                              : [...prev.season, season]
                          }))
                        }}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          outfitDetails.season.includes(season)
                            ? 'bg-brand text-background'
                            : 'bg-elev text-muted-foreground hover:bg-muted/10'
                        }`}
                      >
                        {season}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-6 border-t border-border/50">
                <button
                  onClick={() => setShowOutfitForm(false)}
                  className="flex-1 px-4 py-2 bg-elev text-foreground rounded-lg hover:bg-muted/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowOutfitForm(false)}
                  className="flex-1 brand-button"
                >
                  Save Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        element={canvasRef.current}
        data={{
          name: outfitDetails.name || 'My Outfit',
          type: 'outfit',
          metadata: {
            items: outfitItems,
            details: outfitDetails
          }
        }}
      />
    </div>
  )
}
