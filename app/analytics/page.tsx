'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Shirt,
  Award,
  Target
} from 'lucide-react'
import TopBar from '@/components/TopBar'
import { mockItems, getItemsByCategory, getItemsBySeason } from '@/lib/mockData'

export default function AnalyticsPage() {
  const totalItems = mockItems.length
  const totalValue = mockItems.reduce((sum, item) => sum + (item.price || 0), 0)
  const averagePrice = totalItems > 0 ? totalValue / totalItems : 0

  // Category breakdown
  const categoryStats = [
    { name: 'Tops', count: getItemsByCategory('TOP').length, color: 'bg-blue-500' },
    { name: 'Bottoms', count: getItemsByCategory('BOTTOM').length, color: 'bg-green-500' },
    { name: 'Dresses', count: getItemsByCategory('DRESS').length, color: 'bg-pink-500' },
    { name: 'Outerwear', count: getItemsByCategory('OUTERWEAR').length, color: 'bg-purple-500' },
    { name: 'Shoes', count: getItemsByCategory('SHOES').length, color: 'bg-yellow-500' },
    { name: 'Accessories', count: getItemsByCategory('ACCESSORY').length, color: 'bg-red-500' },
  ]

  // Season breakdown
  const seasonStats = [
    { name: 'Spring', count: getItemsBySeason('SPRING').length, color: 'bg-emerald-400' },
    { name: 'Summer', count: getItemsBySeason('SUMMER').length, color: 'bg-amber-400' },
    { name: 'Fall', count: getItemsBySeason('FALL').length, color: 'bg-orange-400' },
    { name: 'Winter', count: getItemsBySeason('WINTER').length, color: 'bg-cyan-400' },
  ]

  const maxCategoryCount = Math.max(...categoryStats.map(s => s.count))
  const maxSeasonCount = Math.max(...seasonStats.map(s => s.count))

  const metrics = [
    {
      label: 'Total Items',
      value: totalItems.toString(),
      change: '+3 this week',
      icon: Shirt,
      color: 'text-primary',
    },
    {
      label: 'Total Value',
      value: `$${totalValue.toFixed(0)}`,
      change: '+$120 this month',
      icon: DollarSign,
      color: 'text-green-400',
    },
    {
      label: 'Avg. Price',
      value: `$${averagePrice.toFixed(0)}`,
      change: '↗ 8% vs last month',
      icon: TrendingUp,
      color: 'text-blue-400',
    },
    {
      label: 'Outfits Created',
      value: '12',
      change: '+4 this week',
      icon: Calendar,
      color: 'text-purple-400',
    },
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
        >
          <h1 className="display-text mb-2">Style Analytics</h1>
          <p className="text-muted-foreground text-lg">
            Insights into your wardrobe and wearing patterns
          </p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                  delay: 0.2 + index * 0.1,
                }}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-border transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                  <span className="text-xs text-muted-foreground">
                    {metric.change}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
          className="bg-card rounded-2xl p-6 border border-border/50"
        >
          <h2 className="section-title mb-6">Items by Category</h2>
          <div className="space-y-4">
            {categoryStats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                  delay: 0.4 + index * 0.1,
                }}
                className="flex items-center gap-4"
              >
                <div className="w-20 text-sm font-medium text-foreground">
                  {stat.name}
                </div>
                <div className="flex-1">
                  <div className="bg-secondary rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-2 rounded-full ${stat.color}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: maxCategoryCount > 0 ? `${(stat.count / maxCategoryCount) * 100}%` : '0%'
                      }}
                      transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                        delay: 0.5 + index * 0.1,
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm font-semibold text-foreground text-right">
                  {stat.count}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Season Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
          className="bg-card rounded-2xl p-6 border border-border/50"
        >
          <h2 className="section-title mb-6">Items by Season</h2>
          <div className="space-y-4">
            {seasonStats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                  delay: 0.5 + index * 0.1,
                }}
                className="flex items-center gap-4"
              >
                <div className="w-20 text-sm font-medium text-foreground">
                  {stat.name}
                </div>
                <div className="flex-1">
                  <div className="bg-secondary rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-2 rounded-full ${stat.color}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: maxSeasonCount > 0 ? `${(stat.count / maxSeasonCount) * 100}%` : '0%'
                      }}
                      transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                        delay: 0.6 + index * 0.1,
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm font-semibold text-foreground text-right">
                  {stat.count}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wear Frequency (Placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
            className="bg-card rounded-2xl p-6 border border-border/50"
          >
            <h2 className="section-title mb-6">Most Worn Items</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-2">Start tracking wear patterns</p>
              <p className="text-sm text-muted-foreground">
                Track which pieces you wear most often to optimize your wardrobe
              </p>
            </div>
          </motion.div>

          {/* Cost Per Wear (Placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
            className="bg-card rounded-2xl p-6 border border-border/50"
          >
            <h2 className="section-title mb-6">Cost Per Wear</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-2">Analyze purchase value</p>
              <p className="text-sm text-muted-foreground">
                See which items give you the best cost per wear ratio
              </p>
            </div>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.7 }}
          className="bg-gradient-to-br from-card to-accent/20 rounded-2xl p-8 border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Wardrobe Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background/50 rounded-xl p-4 border border-border/30">
              <h3 className="font-semibold text-foreground mb-2">Most Represented Category</h3>
              <p className="text-sm text-muted-foreground">
                {categoryStats.reduce((max, current) => 
                  current.count > max.count ? current : max, categoryStats[0]
                ).name} ({categoryStats.reduce((max, current) => 
                  current.count > max.count ? current : max, categoryStats[0]
                ).count} items)
              </p>
            </div>
            
            <div className="bg-background/50 rounded-xl p-4 border border-border/30">
              <h3 className="font-semibold text-foreground mb-2">Investment Style</h3>
              <p className="text-sm text-muted-foreground">
                {totalValue > 1000 ? 'Premium' : 'Budget-conscious'} wardrobe with ${averagePrice.toFixed(0)} average item cost
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}