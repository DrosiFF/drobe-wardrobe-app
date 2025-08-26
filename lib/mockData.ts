export interface MockItem {
  id: string
  name: string
  imageUrl: string
  bgRemovedUrl?: string
  category: 'TOP' | 'BOTTOM' | 'DRESS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORY' | 'BAG' | 'HAT' | 'OTHER'
  brand?: string
  color?: string
  fabric?: string
  season?: 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'ALL'
  occasion?: 'CASUAL' | 'WORK' | 'FORMAL' | 'PARTY' | 'SPORT' | 'BEACH' | 'TRAVEL'
  price?: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface MockOutfit {
  id: string
  name: string
  notes?: string
  items: {
    id: string
    itemId: string
    slot: string
  }[]
  createdAt: string
  updatedAt: string
}

export const mockItems: MockItem[] = [
  {
    id: '1',
    name: 'Navy Blue Blazer',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
    category: 'OUTERWEAR',
    brand: 'Hugo Boss',
    color: 'Navy Blue',
    fabric: 'Wool',
    season: 'ALL',
    occasion: 'WORK',
    price: 299.99,
    tags: ['professional', 'versatile', 'classic'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'White Cotton Shirt',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
    category: 'TOP',
    brand: 'Uniqlo',
    color: 'White',
    fabric: 'Cotton',
    season: 'ALL',
    occasion: 'WORK',
    price: 39.99,
    tags: ['basic', 'versatile', 'crisp'],
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z'
  },
  {
    id: '3',
    name: 'Dark Wash Jeans',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    category: 'BOTTOM',
    brand: 'Levi\'s',
    color: 'Dark Blue',
    fabric: 'Denim',
    season: 'ALL',
    occasion: 'CASUAL',
    price: 89.99,
    tags: ['classic', 'durable', 'everyday'],
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-17T14:20:00Z'
  },
  {
    id: '4',
    name: 'Black Leather Oxfords',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    category: 'SHOES',
    brand: 'Cole Haan',
    color: 'Black',
    fabric: 'Leather',
    season: 'ALL',
    occasion: 'WORK',
    price: 199.99,
    tags: ['formal', 'leather', 'classic'],
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  },
  {
    id: '5',
    name: 'Floral Summer Dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
    category: 'DRESS',
    brand: 'Zara',
    color: 'Floral',
    fabric: 'Chiffon',
    season: 'SUMMER',
    occasion: 'CASUAL',
    price: 59.99,
    tags: ['feminine', 'light', 'colorful'],
    createdAt: '2024-01-19T11:15:00Z',
    updatedAt: '2024-01-19T11:15:00Z'
  },
  {
    id: '6',
    name: 'Cashmere Sweater',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    category: 'TOP',
    brand: 'Everlane',
    color: 'Cream',
    fabric: 'Cashmere',
    season: 'WINTER',
    occasion: 'CASUAL',
    price: 149.99,
    tags: ['luxury', 'soft', 'warm'],
    createdAt: '2024-01-20T13:30:00Z',
    updatedAt: '2024-01-20T13:30:00Z'
  },
  {
    id: '7',
    name: 'White Sneakers',
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop',
    category: 'SHOES',
    brand: 'Adidas',
    color: 'White',
    fabric: 'Leather',
    season: 'ALL',
    occasion: 'CASUAL',
    price: 79.99,
    tags: ['comfortable', 'versatile', 'sporty'],
    createdAt: '2024-01-21T08:45:00Z',
    updatedAt: '2024-01-21T08:45:00Z'
  },
  {
    id: '8',
    name: 'Silk Scarf',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
    category: 'ACCESSORY',
    brand: 'Hermès',
    color: 'Multicolor',
    fabric: 'Silk',
    season: 'ALL',
    occasion: 'FORMAL',
    price: 349.99,
    tags: ['luxury', 'elegant', 'statement'],
    createdAt: '2024-01-22T15:20:00Z',
    updatedAt: '2024-01-22T15:20:00Z'
  }
]

export const mockOutfits: MockOutfit[] = [
  {
    id: '1',
    name: 'Business Professional',
    notes: 'Perfect for important meetings and presentations',
    items: [
      { id: '1', itemId: '1', slot: 'outerwear' },
      { id: '2', itemId: '2', slot: 'top' },
      { id: '3', itemId: '3', slot: 'bottom' },
      { id: '4', itemId: '4', slot: 'shoes' }
    ],
    createdAt: '2024-01-23T09:00:00Z',
    updatedAt: '2024-01-23T09:00:00Z'
  },
  {
    id: '2',
    name: 'Summer Casual',
    notes: 'Light and breezy for warm days',
    items: [
      { id: '5', itemId: '5', slot: 'dress' },
      { id: '6', itemId: '7', slot: 'shoes' }
    ],
    createdAt: '2024-01-24T14:30:00Z',
    updatedAt: '2024-01-24T14:30:00Z'
  }
]

// Utility functions for working with mock data
export const getItemsByCategory = (category: MockItem['category']) => {
  return mockItems.filter(item => item.category === category)
}

export const getItemsByColor = (color: string) => {
  return mockItems.filter(item => 
    item.color?.toLowerCase().includes(color.toLowerCase())
  )
}

export const getItemsBySeason = (season: MockItem['season']) => {
  return mockItems.filter(item => 
    item.season === season || item.season === 'ALL'
  )
}

export const getItemsByOccasion = (occasion: MockItem['occasion']) => {
  return mockItems.filter(item => item.occasion === occasion)
}

export const searchItems = (query: string) => {
  const lowerQuery = query.toLowerCase()
  return mockItems.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.brand?.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

