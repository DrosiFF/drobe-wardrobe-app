'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shirt,
  Edit,
  Trash2,
  Eye,
  Clock,
  MapPin,
  Users,
  Repeat,
  Bell,
  Tag,
  Search
} from 'lucide-react'
import TopBar from '@/components/TopBar'
import { mockItems } from '@/lib/mockData'

interface OutfitPlan {
  id: string
  date: string
  time?: string
  outfitId: string
  outfitName: string
  items: string[] // item IDs
  occasion: string
  location?: string
  notes?: string
  reminder?: boolean
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly'
}

// Mock existing outfits
const mockExistingOutfits = [
  {
    id: 'outfit-1',
    name: 'Business Casual Monday',
    items: ['1', '2', '3'],
    occasion: 'Work',
    imageUrl: mockItems[0].imageUrl
  },
  {
    id: 'outfit-2', 
    name: 'Date Night Look',
    items: ['4', '5'],
    occasion: 'Date Night',
    imageUrl: mockItems[3].imageUrl
  },
  {
    id: 'outfit-3',
    name: 'Weekend Casual',
    items: ['6', '7', '8'],
    occasion: 'Casual',
    imageUrl: mockItems[5].imageUrl
  },
  {
    id: 'outfit-4',
    name: 'Summer Beach Vibes',
    items: ['1', '6'],
    occasion: 'Casual',
    imageUrl: mockItems[0].imageUrl
  },
  {
    id: 'outfit-5',
    name: 'Workout Session',
    items: ['2', '7'],
    occasion: 'Sport',
    imageUrl: mockItems[1].imageUrl
  }
]

// Mock outfit plans
const mockOutfitPlans: OutfitPlan[] = [
  {
    id: '1',
    date: '2024-08-25',
    time: '09:00',
    outfitId: 'outfit-1',
    outfitName: 'Business Casual Monday',
    items: ['1', '2', '3'], // These reference mockItems
    occasion: 'Work',
    location: 'Office',
    notes: 'Important client meeting',
    reminder: true,
    recurring: 'weekly'
  },
  {
    id: '2',
    date: '2024-08-26',
    time: '19:00',
    outfitId: 'outfit-2',
    outfitName: 'Date Night Look',
    items: ['4', '5'],
    occasion: 'Date Night',
    location: 'Restaurant',
    reminder: true,
    recurring: 'none'
  },
  {
    id: '3',
    date: '2024-08-30',
    outfitId: 'outfit-3',
    outfitName: 'Weekend Casual',
    items: ['6', '7', '8'],
    occasion: 'Casual',
    notes: 'Brunch with friends',
    recurring: 'none'
  }
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddPlan, setShowAddPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<OutfitPlan | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [planningMode, setPlanningMode] = useState<'existing' | 'create'>('existing')
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(null)
  const [newOutfitItems, setNewOutfitItems] = useState<string[]>([])
  const [searchOutfits, setSearchOutfits] = useState('')

  // Get calendar data
  const today = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayOfCalendar = new Date(firstDayOfMonth)
  firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfMonth.getDay())

  const daysInCalendar = []
  let currentDay = new Date(firstDayOfCalendar)
  
  for (let i = 0; i < 42; i++) {
    daysInCalendar.push(new Date(currentDay))
    currentDay.setDate(currentDay.getDate() + 1)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Get plans for a specific date
  const getPlansForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return mockOutfitPlans.filter(plan => plan.date === dateString)
  }

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  // Filter existing outfits
  const filteredExistingOutfits = mockExistingOutfits.filter(outfit =>
    outfit.name.toLowerCase().includes(searchOutfits.toLowerCase()) ||
    outfit.occasion.toLowerCase().includes(searchOutfits.toLowerCase())
  )

  // Add item to new outfit
  const addItemToNewOutfit = (itemId: string) => {
    if (!newOutfitItems.includes(itemId)) {
      setNewOutfitItems(prev => [...prev, itemId])
    }
  }

  // Remove item from new outfit
  const removeItemFromNewOutfit = (itemId: string) => {
    setNewOutfitItems(prev => prev.filter(id => id !== itemId))
  }

  // Reset planning modal
  const resetPlanningModal = () => {
    setShowAddPlan(false)
    setPlanningMode('existing')
    setSelectedOutfit(null)
    setNewOutfitItems([])
    setSearchOutfits('')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      
      <main className="flex-1 p-8 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="display-text mb-2">Outfit Calendar</h1>
            <p className="text-muted-foreground">
              Plan your outfits and never run out of ideas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-elev text-foreground rounded-lg hover:bg-muted/10 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setShowAddPlan(true)}
              className="brand-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Plan Outfit
            </button>
          </div>
        </motion.div>

        {/* Calendar Navigation */}
        <div className="card-base mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-elev rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-elev rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {(['month', 'week', 'day'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-brand text-background'
                      : 'bg-elev text-muted-foreground hover:bg-muted/10'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {daysInCalendar.map((date, index) => {
              const plans = getPlansForDate(date)
              const dateString = date.toISOString().split('T')[0]
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`min-h-[120px] p-2 border border-border/30 rounded-lg cursor-pointer transition-colors ${
                    isToday(date)
                      ? 'bg-brand/10 border-brand/50'
                      : isCurrentMonth(date)
                      ? 'bg-panel hover:bg-elev'
                      : 'bg-background/50 text-muted-foreground'
                  } ${selectedDate === dateString ? 'ring-2 ring-brand' : ''}`}
                  onClick={() => setSelectedDate(selectedDate === dateString ? null : dateString)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      isToday(date) ? 'text-brand font-bold' : ''
                    }`}>
                      {date.getDate()}
                    </span>
                    {plans.length > 0 && (
                      <span className="w-2 h-2 bg-brand rounded-full" />
                    )}
                  </div>
                  
                  {/* Mini Outfit Plans */}
                  <div className="space-y-1">
                    {plans.slice(0, 2).map(plan => (
                      <div
                        key={plan.id}
                        className="p-1 bg-elev rounded text-xs truncate hover:bg-muted/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPlan(plan)
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <Shirt className="w-3 h-3" />
                          <span>{plan.outfitName}</span>
                        </div>
                        {plan.time && (
                          <div className="text-muted-foreground text-xs">
                            {plan.time}
                          </div>
                        )}
                      </div>
                    ))}
                    {plans.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{plans.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="card-base mb-6"
            >
              <h3 className="text-lg font-semibold mb-4">
                {formatDate(selectedDate)}
              </h3>
              
              {getPlansForDate(new Date(selectedDate)).length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">No outfits planned for this day</p>
                  <button
                    onClick={() => setShowAddPlan(true)}
                    className="brand-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Plan Outfit
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getPlansForDate(new Date(selectedDate)).map(plan => (
                    <div key={plan.id} className="card-base">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{plan.outfitName}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {plan.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {plan.time}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {plan.occasion}
                            </span>
                            {plan.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {plan.location}
                              </span>
                            )}
                          </div>
                          {plan.notes && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              "{plan.notes}"
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPlan(plan)}
                            className="p-2 hover:bg-elev rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-elev rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-elev rounded-lg transition-colors text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Outfit Preview */}
                      <div className="flex items-center gap-2 mt-4">
                        {plan.items.slice(0, 3).map(itemId => {
                          const item = mockItems.find(i => i.id === itemId)
                          return item ? (
                            <div key={itemId} className="w-12 h-12 bg-elev rounded-lg overflow-hidden">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : null
                        })}
                        {plan.items.length > 3 && (
                          <div className="w-12 h-12 bg-elev rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                            +{plan.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Enhanced Outfit Planning Modal */}
      <AnimatePresence>
        {showAddPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={resetPlanningModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-base max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Plan Your Outfit</h3>
                <button
                  onClick={resetPlanningModal}
                  className="p-2 hover:bg-elev rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="flex gap-6 h-[70vh]">
                {/* Left Panel - Outfit Selection */}
                <div className="w-1/2 flex flex-col">
                  {/* Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setPlanningMode('existing')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        planningMode === 'existing'
                          ? 'bg-brand text-background'
                          : 'bg-elev text-muted-foreground hover:bg-muted/10'
                      }`}
                    >
                      Use Existing Outfit
                    </button>
                    <button
                      onClick={() => setPlanningMode('create')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        planningMode === 'create'
                          ? 'bg-brand text-background'
                          : 'bg-elev text-muted-foreground hover:bg-muted/10'
                      }`}
                    >
                      Create New Outfit
                    </button>
                  </div>

                  {planningMode === 'existing' ? (
                    /* Existing Outfits Mode */
                    <div className="flex-1 flex flex-col">
                      {/* Search */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search outfits..."
                          value={searchOutfits}
                          onChange={(e) => setSearchOutfits(e.target.value)}
                          className="input-field pl-10"
                        />
                      </div>

                      {/* Outfit Grid */}
                      <div className="flex-1 overflow-y-auto space-y-3">
                        {filteredExistingOutfits.map(outfit => (
                          <motion.div
                            key={outfit.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedOutfit === outfit.id
                                ? 'border-brand bg-brand/10'
                                : 'border-border/50 hover:border-brand/30 hover:bg-elev'
                            }`}
                            onClick={() => setSelectedOutfit(outfit.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-elev rounded-lg overflow-hidden">
                                <img
                                  src={outfit.imageUrl}
                                  alt={outfit.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{outfit.name}</h4>
                                <p className="text-sm text-muted-foreground">{outfit.occasion} • {outfit.items.length} items</p>
                              </div>
                              {selectedOutfit === outfit.id && (
                                <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center">
                                  <Plus className="w-3 h-3 text-background rotate-45" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Create New Outfit Mode */
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-medium mb-3">Select Items for Your Outfit</h4>
                      
                      {/* Selected Items */}
                      {newOutfitItems.length > 0 && (
                        <div className="mb-4 p-3 bg-elev rounded-lg">
                          <p className="text-sm font-medium mb-2">Selected Items ({newOutfitItems.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {newOutfitItems.map(itemId => {
                              const item = mockItems.find(i => i.id === itemId)
                              return item ? (
                                <div key={itemId} className="relative group">
                                  <div className="w-12 h-12 bg-panel rounded-lg overflow-hidden">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    onClick={() => removeItemFromNewOutfit(itemId)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    <Plus className="w-2 h-2 rotate-45" />
                                  </button>
                                </div>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}

                      {/* Available Items */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-2">
                          {mockItems.slice(0, 9).map(item => (
                            <motion.div
                              key={item.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                                newOutfitItems.includes(item.id)
                                  ? 'border-brand'
                                  : 'border-transparent hover:border-brand/50'
                              }`}
                              onClick={() => addItemToNewOutfit(item.id)}
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Panel - Schedule Details */}
                <div className="w-1/2 flex flex-col">
                  <h4 className="font-medium mb-4">Schedule Details</h4>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date *</label>
                      <input
                        type="date"
                        className="input-field"
                        defaultValue={selectedDate || today.toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <input
                        type="time"
                        className="input-field"
                      />
                    </div>
                    
                    {planningMode === 'create' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Outfit Name *</label>
                        <input
                          type="text"
                          placeholder="e.g., Morning Coffee Look"
                          className="input-field"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Occasion</label>
                      <select className="input-field">
                        <option value="">Select occasion</option>
                        <option value="work">Work</option>
                        <option value="casual">Casual</option>
                        <option value="party">Party</option>
                        <option value="date-night">Date Night</option>
                        <option value="sport">Sport</option>
                        <option value="travel">Travel</option>
                        <option value="formal">Formal</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <input
                        type="text"
                        placeholder="e.g., Office, Restaurant"
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <textarea
                        placeholder="Any special notes or reminders..."
                        className="input-field"
                        rows={3}
                      />
                    </div>

                    {/* Preview */}
                    {(selectedOutfit || newOutfitItems.length > 0) && (
                      <div className="p-4 bg-elev rounded-lg">
                        <h5 className="font-medium mb-2">Preview</h5>
                        <div className="flex items-center gap-2">
                          {planningMode === 'existing' && selectedOutfit ? (
                            (() => {
                              const outfit = mockExistingOutfits.find(o => o.id === selectedOutfit)
                              return outfit ? (
                                <>
                                  <div className="w-10 h-10 bg-panel rounded-lg overflow-hidden">
                                    <img
                                      src={outfit.imageUrl}
                                      alt={outfit.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{outfit.name}</p>
                                    <p className="text-xs text-muted-foreground">{outfit.items.length} items</p>
                                  </div>
                                </>
                              ) : null
                            })()
                          ) : (
                            newOutfitItems.slice(0, 3).map(itemId => {
                              const item = mockItems.find(i => i.id === itemId)
                              return item ? (
                                <div key={itemId} className="w-8 h-8 bg-panel rounded overflow-hidden">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : null
                            })
                          )}
                          {planningMode === 'create' && newOutfitItems.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{newOutfitItems.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-border/50">
                    <button
                      onClick={resetPlanningModal}
                      className="flex-1 px-4 py-2 bg-elev text-foreground rounded-lg hover:bg-muted/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={resetPlanningModal}
                      disabled={planningMode === 'existing' ? !selectedOutfit : newOutfitItems.length === 0}
                      className="flex-1 brand-button disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Schedule Outfit
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
