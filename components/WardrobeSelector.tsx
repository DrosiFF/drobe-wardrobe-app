'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus, Shirt, Package, Home, Star } from 'lucide-react'
// import { useUser } from '@clerk/nextjs'
// import { wardrobesService, type Wardrobe } from '@/lib/supabase'

// Temporary type for wardrobe
type Wardrobe = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  is_default: boolean
}

interface WardrobeSelectorProps {
  selectedWardrobeId?: string | null
  onWardrobeChange: (wardrobeId: string) => void
  className?: string
}

const iconMap: Record<string, any> = {
  shirt: Shirt,
  package: Package,
  home: Home,
  star: Star,
}

export default function WardrobeSelector({ 
  selectedWardrobeId, 
  onWardrobeChange, 
  className = "" 
}: WardrobeSelectorProps) {
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  // const { user } = useUser() // Temporarily disabled
  const user = null // Use null for now

  useEffect(() => {
    // If auth isn't configured yet, provide mock wardrobes so the UI works
    if (!user) {
      const mock: Wardrobe[] = [
        {
          id: 'mock-1',
          name: 'Main Wardrobe',
          description: 'Your main clothing collection',
          icon: 'shirt',
          color: '#22c55e',
          is_default: true
        }
      ]
      setWardrobes(mock)
      if (!selectedWardrobeId) {
        onWardrobeChange(mock[0].id)
      }
      setLoading(false)
      return
    }

    loadWardrobes()
  }, [user])

  const loadWardrobes = async () => {
    if (!user) return
    
    try {
      // const data = await wardrobesService.getUserWardrobes(user.id)
      // Mock data for now
      const data: Wardrobe[] = [
        {
          id: '1',
          name: 'Main Wardrobe',
          description: 'Your main clothing collection',
          icon: 'shirt',
          color: '#22c55e',
          is_default: true
        }
      ]
      setWardrobes(data)
      
      // If no wardrobe is selected, select the default one
      if (!selectedWardrobeId && data.length > 0) {
        const defaultWardrobe = data.find(w => w.is_default) || data[0]
        onWardrobeChange(defaultWardrobe.id)
      }
    } catch (error) {
      console.error('Failed to load wardrobes:', error)
      // Use mock data if Supabase isn't set up yet
      const mockWardrobes: Wardrobe[] = [
        {
          id: 'mock-1',
          name: 'Main Wardrobe',
          description: 'Your main clothing collection',
          icon: 'shirt',
          color: '#22c55e',
          is_default: true
        }
      ]
      setWardrobes(mockWardrobes)
      if (!selectedWardrobeId) {
        onWardrobeChange(mockWardrobes[0].id)
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedWardrobe = wardrobes.find(w => w.id === selectedWardrobeId)

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-12 ${className}`} />
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between hover:border-gray-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedWardrobe && (
            <>
              <div 
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: selectedWardrobe.color || '#22c55e' }}
              >
                {(() => {
                  const iconKey = selectedWardrobe.icon || 'shirt'
                  const IconComponent = iconMap[iconKey] || Shirt
                  return <IconComponent className="w-2.5 h-2.5 text-white" />
                })()}
              </div>
              <span className="font-medium text-gray-900">
                {selectedWardrobe.name}
              </span>
              {selectedWardrobe.is_default && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Default
                </span>
              )}
            </>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {wardrobes.map((wardrobe) => {
            const IconComponent = iconMap[wardrobe.icon || 'shirt'] || Shirt
            return (
              <button
                key={wardrobe.id}
                onClick={() => {
                  onWardrobeChange(wardrobe.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  wardrobe.id === selectedWardrobeId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: wardrobe.color || '#22c55e' }}
                >
                  <IconComponent className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">
                    {wardrobe.name}
                  </div>
                  {wardrobe.description && (
                    <div className="text-sm text-gray-500">
                      {wardrobe.description}
                    </div>
                  )}
                </div>
                {wardrobe.is_default && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </button>
            )
          })}
          
          <div className="border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-blue-600"
            >
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Plus className="w-2.5 h-2.5 text-blue-600" />
              </div>
              <span className="font-medium">Create New Wardrobe</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
