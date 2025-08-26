'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingBag, 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Filter,
  Search,
  Tag,
  MapPin,
  CreditCard,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import TopBar from '@/components/TopBar'
import ItemCard from '@/components/ItemCard'
import { mockItems } from '@/lib/mockData'

interface Purchase {
  id: string
  itemId: string
  purchaseDate: string
  price: number
  store: string
  location: string
  paymentMethod: string
  notes?: string
}

// Mock purchase data
const mockPurchases: Purchase[] = [
  {
    id: '1',
    itemId: '1',
    purchaseDate: '2024-01-15',
    price: 89.99,
    store: 'Zara',
    location: 'SoHo Store, NYC',
    paymentMethod: 'Credit Card',
    notes: 'Great fit, love the color'
  },
  {
    id: '2', 
    itemId: '2',
    purchaseDate: '2024-01-10',
    price: 129.99,
    store: 'H&M',
    location: 'Online',
    paymentMethod: 'PayPal'
  },
  {
    id: '3',
    itemId: '3', 
    purchaseDate: '2024-01-05',
    price: 199.99,
    store: 'Uniqlo',
    location: 'Times Square, NYC',
    paymentMethod: 'Cash',
    notes: 'Perfect for winter'
  }
]

export default function PurchasesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'store'>('date')
  const [showAddPurchase, setShowAddPurchase] = useState(false)
  
  // Calculate stats
  const totalSpent = mockPurchases.reduce((sum, purchase) => sum + purchase.price, 0)
  const avgPrice = totalSpent / mockPurchases.length
  const thisMonthSpent = mockPurchases
    .filter(p => new Date(p.purchaseDate).getMonth() === new Date().getMonth())
    .reduce((sum, purchase) => sum + purchase.price, 0)
  
  // Filter and sort purchases
  const filteredPurchases = mockPurchases
    .filter(purchase => {
      const item = mockItems.find(i => i.id === purchase.itemId)
      return item?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             purchase.store.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        case 'price':
          return b.price - a.price
        case 'store':
          return a.store.localeCompare(b.store)
        default:
          return 0
      }
    })

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      
      <main className="flex-1 p-8 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="display-text mb-2">Purchase History</h1>
            <p className="text-muted-foreground">
              Track your fashion investments and spending
            </p>
          </div>
          <button
            onClick={() => setShowAddPurchase(true)}
            className="brand-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Purchase
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-base"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-2/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-brand-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">${avgPrice.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Average Price</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-base"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${thisMonthSpent.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'store')}
            className="input-field w-full sm:w-48"
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="store">Sort by Store</option>
          </select>
        </div>

        {/* Purchase List */}
        <div className="space-y-4">
          {filteredPurchases.map((purchase, index) => {
            const item = mockItems.find(i => i.id === purchase.itemId)
            if (!item) return null

            return (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-base hover-lift"
              >
                <div className="flex items-center gap-6">
                  {/* Item Image */}
                  <div className="w-20 h-20 bg-elev rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                    <p className="text-muted-foreground">{item.brand}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {purchase.store}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(purchase.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {purchase.paymentMethod}
                      </span>
                    </div>
                    {purchase.notes && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        "{purchase.notes}"
                      </p>
                    )}
                  </div>

                  {/* Purchase Info */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-brand">
                      ${purchase.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button className="p-2 hover:bg-elev rounded-lg transition-colors">
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
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredPurchases.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No purchases found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Start tracking your fashion purchases'}
            </p>
            <button
              onClick={() => setShowAddPurchase(true)}
              className="brand-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Purchase
            </button>
          </div>
        )}
      </main>
    </div>
  )
}



