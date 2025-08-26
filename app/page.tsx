'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  Shirt,
  Palette,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import TopBar from '@/components/TopBar'
import ItemCard from '@/components/ItemCard'
import { mockItems } from '@/lib/mockData'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const totalItems = mockItems.length
  const totalValue = mockItems.reduce((sum, item) => sum + (item.price || 0), 0)
  const recentItems = mockItems.slice(-6)

  const stats = [
    {
      label: 'Total Items',
      value: totalItems.toString(),
      change: '+3 this week',
      icon: Shirt,
      trend: 'up' as const,
    },
    {
      label: 'Wardrobe Value',
      value: `$${totalValue.toFixed(0)}`,
      change: '+$120 this month',
      icon: TrendingUp,
      trend: 'up' as const,
    },
    {
      label: 'Outfits Created',
      value: '12',
      change: '+4 this week',
      icon: Palette,
      trend: 'up' as const,
    },
  ]

  const quickActions = [
    {
      title: 'Smart Upload',
      description: 'Add items with AI analysis',
      href: '/upload',
      icon: Sparkles,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Create Outfit',
      description: 'Mix and match your items',
      href: '/outfits/create',
      icon: Palette,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      title: 'View Analytics',
      description: 'Insights about your style',
      href: '/analytics',
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-600',
    },
  ]

  return (
    <div className="min-h-screen">
      <TopBar
        onSearch={setSearchQuery}
        onFilterToggle={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      <div className="content-container py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h1 className="display-text mb-2">Good morning</h1>
          <p className="text-muted-foreground text-lg">
            Ready to style your day?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className={`bg-gradient-to-br ${action.gradient} rounded-2xl p-6 text-white hover:shadow-xl transition-shadow duration-200`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8" />
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-white/80 text-sm">{action.description}</p>
                </motion.div>
              </Link>
            )
          })}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-border transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {stat.change}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Recent Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="section-title">Recently Added</h2>
            <Link href="/items">
              <Button variant="ghost" className="ghost-button">
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {recentItems.length > 0 ? (
            <div className="items-grid">
              {recentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                    delay: 0.4 + index * 0.1,
                  }}
                >
                  <ItemCard
                    id={item.id}
                    name={item.name}
                    imageUrl={item.imageUrl}
                    category={item.category}
                    color={item.color}
                    brand={item.brand}
                    price={item.price}
                    tags={item.tags}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-12 bg-card rounded-2xl border border-border/50"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                  <Shirt className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    No items yet
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Start building your digital wardrobe by adding your first clothing item.
                  </p>
                </div>
                <Link href="/upload">
                  <Button className="brand-button mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Item
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Discover Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
          className="bg-gradient-to-br from-card to-accent/20 rounded-2xl p-8 border border-border/50"
        >
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground">
              Discover Your Style
            </h2>
            <p className="text-muted-foreground">
              Use AI-powered insights to understand your wardrobe patterns, 
              find perfect outfit combinations, and discover new styling opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/analytics">
                <Button variant="secondary" className="w-full sm:w-auto">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/outfits">
                <Button className="brand-button w-full sm:w-auto">
                  <Palette className="w-4 h-4 mr-2" />
                  Create Outfit
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}